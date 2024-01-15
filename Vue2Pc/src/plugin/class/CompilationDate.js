import {
  formatDate,
  parseDate,
  isDateObject,
  getWeekNumber,
  toDate,
  getI18nSettings
} from 'element-ui/src/utils/date-util'

const com = class CompilationDate {
  constructor() {
    this.Date = new Date()
  }
  getValue(val) {
    const Date = this.Date
    return formatDate(Date, val) // 用element-ui的方法 直接获取不同格式的date
  }
}

export default com
