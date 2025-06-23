import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前模块的绝对路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 构建 CSV 文件的绝对路径
const filePath = path.resolve(__dirname, '../translations.csv')

const str = readFileSync(filePath, 'utf8')

function parseCSV2Obj(csvStr) {
  const [headRow, ...dataRows] = csvStr.split('\n').filter(Boolean)

  const langList = headRow.split('\t').filter(Boolean).slice(1)

  langList.forEach((lang, index) => {
    const list = dataRows.map((d) => {
      const arr = d.split('\t')
      const key = arr[0]
      const value = arr[index + 1]
      return { key, value: value }
    })
    const obj = parseSingleLangToObj(list)
    writeObjToFile(lang, obj)
  })
}

function parseSingleLangToObj(list) {
  const result = list.reduce((acc, cur) => {
    const key = cur.key
    const value = cur.value
    const keyArr = key.split('.')

    function setValue(obj) {
      if (keyArr.length === 1) {
        const key = keyArr.shift()
        obj[key] = value
      } else {
        const key = keyArr.shift()
        if (!obj[key]) {
          obj[key] = {}
        }

        setValue(obj[key])
      }
    }

    setValue(acc)

    return acc
  }, {})

  return result
}

function writeObjToFile(lang, obj) {
  const content = `export default ${JSON.stringify(obj, null, 2)}`
  const filePath = path.resolve(__dirname, `../lang/${lang}.js`)
  writeFileSync(filePath, content, 'utf8')
  console.log(`[i18n] 已生成 ${lang} 翻译文件`)
}

parseCSV2Obj(str)
