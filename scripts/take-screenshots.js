import puppeteer from 'puppeteer'
import path from 'path'
import fs from 'fs'

const targetDirs = [
  path.resolve(
    'C:/Users/conta/.gemini/antigravity/brain/b9fddb18-a3f0-4e13-86c1-c46aa3d989fe/screenshots'
  ),
  path.resolve(
    'C:/Users/conta/.gemini/antigravity/brain/3ba77cf6-280a-4bad-8ffd-6a80addb9ccf/screenshots'
  ),
  path.resolve(
    'C:/Users/conta/.gemini/antigravity/brain/daebad54-c542-400d-9bfc-6c6952033c69/screenshots'
  ),
]

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function saveScreenshot(page, filename, options = {}) {
  for (const dir of targetDirs) {
    const filePath = path.join(dir, filename)
    await page.screenshot({ path: filePath, ...options })
    console.log(`Saved screenshot: ${filePath}`)
  }
}

async function saveElementScreenshot(element, filename) {
  for (const dir of targetDirs) {
    const filePath = path.join(dir, filename)
    await element.screenshot({ path: filePath })
    console.log(`Saved element screenshot: ${filePath}`)
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 })

  console.log('Navegando para http://localhost:5173...')
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' })

  // 1. Light Mode Full Page Screenshot
  console.log('Capturando Modo Claro...')
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('dailyflow_theme', 'light')
  })
  await new Promise((r) => setTimeout(r, 600))
  await saveScreenshot(page, 'app-light-mode.png')

  // 2. Card Hover state in Light Mode
  console.log('Capturando Hover no Card (Modo Claro)...')
  const firstCard = await page.$('.group.cursor-grab')
  if (firstCard) {
    await firstCard.hover()
    await new Promise((r) => setTimeout(r, 400))
    await saveElementScreenshot(firstCard, 'card-hover-state.png')
  }

  // 3. Column Cards and Borders in Light Mode
  console.log('Capturando Coluna de Cards (Modo Claro)...')
  const firstColumn = await page.$('[role="region"]')
  if (firstColumn) {
    await saveElementScreenshot(firstColumn, 'column-cards-border.png')
  }

  // 4. Focus / Pomodoro State Screenshot
  console.log('Iniciando Pomodoro para verificar Card em Foco...')
  const playButton = await page.$('button[title="Iniciar Pomodoro nesta tarefa"]')
  if (playButton) {
    await playButton.click()
    await new Promise((r) => setTimeout(r, 500))
    const focusedCard = await page.$('.group.cursor-grab')
    if (focusedCard) {
      await saveElementScreenshot(focusedCard, 'card-focus-state.png')
    }
  }

  // 5. Dark Mode Full Page Screenshot
  console.log('Capturando Modo Escuro...')
  await page.evaluate(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('dailyflow_theme', 'dark')
  })
  await new Promise((r) => setTimeout(r, 600))
  await saveScreenshot(page, 'app-dark-mode.png')

  // 6. Card Hover in Dark Mode
  console.log('Capturando Hover no Card (Modo Escuro)...')
  const darkFirstCard = await page.$('.group.cursor-grab')
  if (darkFirstCard) {
    await darkFirstCard.hover()
    await new Promise((r) => setTimeout(r, 400))
    await saveElementScreenshot(darkFirstCard, 'card-hover-dark-state.png')
  }

  // 7. Academic Workspace in Dark Mode
  console.log('Alternando para Espaço Acadêmico (Modo Escuro)...')
  const tabButtons = await page.$$('nav[role="tablist"] button')
  if (tabButtons && tabButtons.length > 1) {
    await tabButtons[1].click()
    await new Promise((r) => setTimeout(r, 600))
    await page.evaluate(() => window.scrollTo(0, 0))
    await new Promise((r) => setTimeout(r, 300))
    await saveScreenshot(page, 'academic-dark-mode.png')

    // Note Modal in Dark Mode
    const newNoteBtn = await page.$('button[title="Criar nova anotação"]')
    if (newNoteBtn) {
      await newNoteBtn.click()
      await new Promise((r) => setTimeout(r, 500))
      await saveScreenshot(page, 'academic-note-modal-dark.png')
      await page.keyboard.press('Escape')
      await new Promise((r) => setTimeout(r, 400))
    }

    // 8. Academic Workspace in Light Mode
    console.log('Alternando para Modo Claro no Espaço Acadêmico...')
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('dailyflow_theme', 'light')
      window.scrollTo(0, 0)
    })
    await new Promise((r) => setTimeout(r, 600))
    await saveScreenshot(page, 'academic-light-mode.png')

    // 9. Studio Mode in Light Mode
    console.log('Alternando para Modo Studio (Light Mode)...')
    const studioBtn = await page.$('button[aria-label="Modo Studio"]')
    if (studioBtn) {
      await studioBtn.click()
      await new Promise((r) => setTimeout(r, 600))
      await saveScreenshot(page, 'academic-studio-light.png')

      // 10. Studio Mode in Dark Mode
      console.log('Alternando para Modo Studio (Dark Mode)...')
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
        localStorage.setItem('dailyflow_theme', 'dark')
      })
      await new Promise((r) => setTimeout(r, 600))
      await saveScreenshot(page, 'academic-studio-dark.png')

      // 11. Zen Mode (Focus Fullscreen)
      console.log('Ativando Modo Zen no Studio...')
      const zenBtn = await page.$('button[aria-label="Ativar Modo Zen"]')
      if (zenBtn) {
        await zenBtn.click()
        await new Promise((r) => setTimeout(r, 600))
        await saveScreenshot(page, 'academic-studio-zen.png')
        await page.keyboard.press('Escape')
        await new Promise((r) => setTimeout(r, 400))
      }
    }
  }

  await browser.close()
  console.log('Todos os screenshots foram capturados com sucesso!')
}

run().catch((err) => {
  console.error('Erro ao capturar screenshots:', err)
  process.exit(1)
})
