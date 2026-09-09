import { supabase } from '../lib/supabase'
import type { AcademicData, AcademicNote, Subject, StudyStatus } from '../types/academic'

export async function fetchAcademicData(userId: string): Promise<AcademicData> {
  const [subjectsRes, notesRes] = await Promise.all([
    supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
    supabase
      .from('academic_notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }),
  ])

  if (subjectsRes.error) {
    console.error('Erro ao buscar disciplinas no Supabase:', subjectsRes.error)
    throw subjectsRes.error
  }

  if (notesRes.error) {
    console.error('Erro ao buscar anotações no Supabase:', notesRes.error)
    throw notesRes.error
  }

  const subjects: Subject[] = (subjectsRes.data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    color: row.color || 'indigo',
    code: row.code || undefined,
    icon: row.icon || undefined,
  }))

  const notes: AcademicNote[] = (notesRes.data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    content: row.content || '',
    subjectId: row.subject_id,
    status: (row.status as StudyStatus) || 'to_review',
    tags: Array.isArray(row.tags) ? row.tags : [],
    isPinned: Boolean(row.is_pinned),
    examDate: row.exam_date || undefined,
    reviewDate: row.review_date || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  }))

  return {
    subjects,
    notes,
    version: 1,
  }
}

export async function syncSubject(userId: string, subject: Subject): Promise<void> {
  const row = {
    id: subject.id,
    user_id: userId,
    name: subject.name,
    color: subject.color,
    code: subject.code ?? null,
    icon: subject.icon ?? null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('subjects').upsert(row, {
    onConflict: 'id,user_id',
  })

  if (error) {
    console.error('Erro ao sincronizar disciplina no Supabase:', error)
    throw error
  }
}

export async function deleteSubject(subjectId: string): Promise<void> {
  const { error: notesErr } = await supabase
    .from('academic_notes')
    .delete()
    .eq('subject_id', subjectId)

  if (notesErr) {
    console.error('Erro ao deletar notas da disciplina no Supabase:', notesErr)
  }

  const { error } = await supabase.from('subjects').delete().eq('id', subjectId)

  if (error) {
    console.error('Erro ao deletar disciplina no Supabase:', error)
    throw error
  }
}

export async function syncNote(userId: string, note: AcademicNote): Promise<void> {
  const row = {
    id: note.id,
    user_id: userId,
    subject_id: note.subjectId,
    title: note.title,
    content: note.content || '',
    status: note.status,
    tags: note.tags || [],
    is_pinned: Boolean(note.isPinned),
    exam_date: note.examDate ?? null,
    review_date: note.reviewDate ?? null,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  }

  const { error } = await supabase.from('academic_notes').upsert(row, {
    onConflict: 'id,user_id',
  })

  if (error) {
    console.error('Erro ao sincronizar anotação no Supabase:', error)
    throw error
  }
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('academic_notes').delete().eq('id', noteId)

  if (error) {
    console.error('Erro ao deletar anotação no Supabase:', error)
    throw error
  }
}

export async function uploadLocalData(userId: string, data: AcademicData): Promise<void> {
  if (data.subjects.length > 0) {
    const subjectRows = data.subjects.map((sub) => ({
      id: sub.id,
      user_id: userId,
      name: sub.name,
      color: sub.color,
      code: sub.code ?? null,
      icon: sub.icon ?? null,
      updated_at: new Date().toISOString(),
    }))

    const { error: subErr } = await supabase.from('subjects').upsert(subjectRows, {
      onConflict: 'id,user_id',
    })

    if (subErr) {
      console.error('Erro ao fazer upload de disciplinas para o Supabase:', subErr)
      throw subErr
    }
  }

  if (data.notes.length > 0) {
    const noteRows = data.notes.map((note) => ({
      id: note.id,
      user_id: userId,
      subject_id: note.subjectId,
      title: note.title,
      content: note.content || '',
      status: note.status,
      tags: note.tags || [],
      is_pinned: Boolean(note.isPinned),
      exam_date: note.examDate ?? null,
      review_date: note.reviewDate ?? null,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    }))

    const { error: noteErr } = await supabase.from('academic_notes').upsert(noteRows, {
      onConflict: 'id,user_id',
    })

    if (noteErr) {
      console.error('Erro ao fazer upload de anotações para o Supabase:', noteErr)
      throw noteErr
    }
  }
}

export const supabaseAcademicService = {
  fetchAcademicData,
  syncSubject,
  deleteSubject,
  syncNote,
  deleteNote,
  uploadLocalData,
}
