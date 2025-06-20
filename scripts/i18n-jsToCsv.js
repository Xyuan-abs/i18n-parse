import fs from 'fs/promises'
import path from 'path'

// 核心功能函数
const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix ? `${prefix}.` : ''
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = obj[k]
    }
    return acc
  }, {})
}

const parseLangFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const cleaned = content.replace(/export\s+default\s+/, '')
    return flattenObject(new Function(`return ${cleaned}`)())
  } catch (e) {
    console.error(`[i18n] 解析失败: ${path.basename(filePath)}`, e)
    return {}
  }
}

// 内置生成器
const generators = {
  csv: (data) => {
    const sep = '\t'
    const header = ['key', ...data.langs].join(sep)
    const rows = data.keys.map((k) => [k, ...data.langs.map((lang) => data.translations[lang][k] || '')].join(sep))
    return [header, ...rows].join('\n')
  },
  markdown: (data) => {
    const header = `| Key | ${data.langs.join(' | ')} |\n|-----|${'-----|'.repeat(data.langs.length)}`
    const rows = data.keys.map(
      (k) => `| ${k} | ${data.langs.map((lang) => data.translations[lang][k] || '').join(' | ')} |`
    )
    return [header, ...rows].join('\n')
  },
}

// 主函数
async function generateTranslations(options = {}) {
  // 合并默认配置
  const config = {
    localesDir: './lang',
    output: './translations.csv',
    format: 'csv',
    ...options,
  }

  console.log('[i18n] 开始生成翻译文件')
  try {
    const files = await fs.readdir(config.localesDir)
    const langFiles = files.filter((f) => f.endsWith('.js'))

    // 并行解析所有语言文件
    const translations = {}
    const langs = []

    await Promise.all(
      langFiles.map(async (file) => {
        const lang = path.basename(file, '.js')
        langs.push(lang)
        translations[lang] = await parseLangFile(path.join(config.localesDir, file))
      })
    )

    // 合并所有翻译键
    const keys = [...new Set(Object.values(translations).flatMap((t) => Object.keys(t)))]

    // 生成内容
    const generator = typeof config.format === 'function' ? config.format : generators[config.format]

    const content = generator({
      langs,
      keys,
      translations,
    })

    // 写入文件
    await fs.mkdir(path.dirname(config.output), { recursive: true })
    await fs.writeFile(config.output, content)

    console.log(`[i18n] 翻译文件已更新: ${path.relative(process.cwd(), config.output)}`)
  } catch (e) {
    console.error(`[i18n] 生成失败: ${e.message}`, e)
  }
}

const args = process.argv.slice(2)
const options = {}

// 简单的命令行参数解析
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--format' || args[i] === '-f') {
    options.format = args[++i]
  } else if (args[i] === '--locales' || args[i] === '-l') {
    options.localesDir = args[++i]
  } else if (args[i] === '--output' || args[i] === '-o') {
    options.output = args[++i]
  }
}
generateTranslations(options)

export default generateTranslations
