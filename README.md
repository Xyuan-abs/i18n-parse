# 多语言翻译脚本

## JS 转 CSV

步骤

1. 将 **多语言 JS 文件** 复制到 **lang** 文件夹下
2. 运行 `node ./scripts/i18n-jsToCsv.js`,在项目根目录下生成 **translations.csv** 文件

## CSV 转 JS

步骤

1. 将翻译好的 Excel 文件内容复制到根目录下的 **translations.csv** 文件里
2. 运行 `node ./scripts/i18n-csvToJs`,在`/lang/`下生成翻译好的 **多语言 JS 文件**
