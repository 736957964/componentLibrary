<!--
可以使用 :value.sync 绑定  也可以单独使用 defaultVal 赋值回显(defaultVal没写)
单独使用 defaultVal  itemField的接收参数不能是计算属性
 weakType 1(没写)  弱类型  value值 数字转字符串  2(没写) 字符串转数字 3  数组转字符串 [1,2,3]=>'1,2,3'
-->
<template>
  <div class="fileUpload">
    <!--action自定义接口的时候使用  :on-success="fileUpload"  -->
    <el-upload
      :disabled="_fileData.disabled"
      class="upload-demo"
      :action="action"
      :file-list="fileList"
      :list-type="_fileData.listType"
      :auto-upload="false"
      :limit="_fileData.limit"
      :on-change="_fileUpload"
      :accept="_fileData.accept"
      :on-preview="_fileData.handlePreview"
      :on-remove="_fileData.handleRemove"
      :before-remove="_fileData.beforeRemove"
      :before-upload="_fileData.beforeUpload"
      multiple
      :on-exceed="_fileData.handleExceed"
    >
      <i v-if="_fileData.listType==='picture-card'" class="el-icon-plus" />
      <el-button v-if="_fileData.listType==='text'" size="small" :disabled="_fileData.disabled">{{ _fileData.btnText }}</el-button>
      <div v-if="_fileData.prompt" slot="tip" class="el-upload__tip">{{ _fileData.prompt }}</div>
    </el-upload>
    <el-dialog append-to-body :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import { FileUpload } from '@/api/system/file'
export default {
  name: 'Index',
  props: {
    value: { // 绑定后获取数据
      type: null,
      default: () => []
    },
    fileData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      isFirst: true,
      dialogImageUrl: '',
      fileList: [],
      fileList2: [],
      dialogVisible: false
    }
  },
  computed: {
    _fileData() {
      return {
        listType: this.fileData.type === 'fileImg' ? 'picture-card' : 'text', // text/picture/picture-card
        limit: 3, // 上传数量限制
        fileSize: 1, // 默认限制1MB
        fileSizeUnit: 'M', // 件大小单位
        accept: this.fileData.type === 'fileImg' ? 'image/jpeg,image/jpg,image/png' : '*', // 接收的文件类型
        btnText: '点击上传', // 上传按钮文案
        prompt: '提示的文字', // 提示的文字
        handlePreview: this.handlePreview,
        handleRemove: this.handleRemove,
        beforeRemove: this.beforeRemove,
        handleExceed: this.handleExceed,
        // defaultVal: this.setValue(this.value) || [], // 上传的文件列表, 例如: [{name: 'food.jpg', url: 'https://xxx.cdn.com/xxx.jpg'}]	array
        beforeUpload: this.beforeUpload,
        disabled: false, // 默认启用
        ...this.fileData
      }
    },
    // 上传接口拼接
    action() {
      // const api = getPublicConfig({ key: 'api' })
      // return `${api}system/sys/file/upload`
      return '#'
    }
  },
  watch: {
    value: {
      handler(val) {
        if (this.isFirst === true) {
          this.fileList = this.setValue(val)
          this.fileList2 = this.setValue(val)
          this.isFirst = false
        }
      },
      immediate: true
    }
  },
  methods: {
    setValue(val) {
      var data = []
      if (Array.isArray(val)) {
        data = val?.map((res) => {
          return { name: res.fileName || res.name, url: res.viewPath || res.url }
        }) || []
      } else if (val !== '') {
        data = JSON.parse(val)?.map((res) => {
          return { name: res.fileName || res.name, url: res.viewPath || res.url }
        }) || []
      } else {
        data = []
      }
      return data
    },
    async _fileUpload(file) {
      const formData = new FormData()
      formData.append('file', file.raw)
      const res = await FileUpload(formData)
      const obj = {}
      obj.url = res.viewPath
      this.fileList2.push({ ...obj })
      let fileList = this.fileList2
      if (this._fileData.weakType === 3) {
        fileList = JSON.stringify(fileList)
      }
      this.$emit('update:value', fileList)
      this.$emit('setRuleForm', fileList)
    },
    // 放大查看的  // 点击文件列表中已上传的文件时的钩子 function(file)
    handlePreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 文件列表移除文件时的钩子	function(file, fileList)
    handleRemove(file, fileList) {
      this.fileList2 = fileList
      this.$emit('update:value', fileList)
      this.$emit('setRuleForm', fileList)
    },
    // 删除文件之前的钩子，参数为上传的文件和文件列表，若返回 false 或者返回 Promise 且被 reject，则停止删除。 function(file, fileList)
    beforeRemove() {},
    // 文件超出个数限制时的钩子	function(files, fileList)
    handleExceed() {},
    // 上传文件之前的钩子，参数为上传的文件，若返回 false 或者返回 Promise 且被 reject，则停止上传。	function(file)
    beforeUpload(file) {
      const { size } = file
      const _fileData = this._fileData
      let limitSizeBt = ''
      if (!this._fileData.accept.includes(file.type) && this._fileData.accept !== '*') {
        // this.$message.error(`当前上传的文件格式不对,当前类型${file.type},可上传类型${this._fileData.accept}`)
        this.$message.error(`当前上传的文件格式有误`)
        return false
      }
      _fileData.beforeUpload2 ? _fileData.beforeUpload2() : '' // 只在原有的基础上额外添加限制
      if (_fileData.fileSizeUnit === 'M') {
        limitSizeBt = _fileData.fileSize * 1024 * 1024
      } else {
        limitSizeBt = _fileData.fileSize * 1024
      }
      if (limitSizeBt < size) {
        this.$message.error(`上传的文件大小不能超过${_fileData.fileSize}${_fileData.fileSizeUnit}!`)
        return false
      }
    }
  }
}
</script>

<style scoped lang="scss">
.el-upload__tip{
  margin-top: 0;
}
.fileUpload{
  .upload-demo{
  }
}
</style>
