<!--
这里如果经过格式处理使用v-model会导致格式问题
格式不对的情况下可以使用单项流 :value绑定  也可以单独使用 defaultVal 赋值回显 @success="($event)=>{$set(ruleForm,'XXXXXXXXX',$event)}进行特殊操作"
单独使用 defaultVal  itemField的接收参数不能是计算属性
requiredFlag 是否显示必填红*   actionAttribute 为 3禁用属性
禁用的 disabled 和requiredFlag同时存在时  优先 disabled
weakType 1  弱类型  value值 数字转字符串  2 字符串转数字 3 type 为 checkbox多选的时候用  数组转字符串 [1,2,3]=>'1,2,3'（weakType 123无效）
5 数组 转 字符串数组 [name:1,url:www.baidu.com] => "[name:1,url:www.baidu.com]"

-->
<template>
  <div class="uploader">
    <van-field
      :label="_itemField.fieldDesc"
      name="uploader"
      :disabled="_itemField.disabled || disabled"
      :rules="_itemField.rules "
      :placeholder="_itemField.placeholder"
    >
      <template #label>
        <div v-if="_itemField.fieldDesc" class="uploader-title">
          <span v-if="!!itemField.requiredFlag && !attrIncludes(itemField, '3')" class="van-cell--require">*</span>
          <span :style="_itemField.disabled || attrIncludes(itemField, '3')?'color:rgb(200, 201, 204)':'color: #646566'">{{ _itemField.fieldDesc }}</span>
        </div>
      </template>
      <template #input>
        <van-uploader
          v-model="fileArr"
          :after-read="afterRead"
          :max-count="_itemField.maxCount"
          :max-size="_itemField.maxSize"
          accept="image/*"
          :disabled="_itemField.disabled || attrIncludes(itemField, '3')"
          multiple
          @oversize="onOversize"
        />
      </template>
    </van-field>
  </div>
</template>

<script>
import formField from '../../mixins/formField'
import { FileUpload } from 'api/system/file'
export default {
  name: 'Index',
  mixins: [formField],
  data() {
    return {
      fileArr: []
    }
  },
  computed: {
    _itemField() {
      return {
        fieldDesc: this.label, // 名称
        maxCount: undefined, // 最大上传数量
        maxSize: undefined, // 文件限制大小 500 * 1024 => 500kb
        rules: [{ required: this.itemField.requiredFlag || false, message: `请选择${this.itemField.fieldDesc || this.label}` }], // 设置的校验
        ...this.itemField
      }
    }
  },
  watch: { },
  methods: {
    /**
     * 文件读取后
     */
    async afterRead(file) {
      try {
        file.status = 'uploading'
        file.message = '上传中...'
        this.itemField.uploadFlag = true // 上传中
        const formData = new FormData()
        formData.append('file', file.file)
        const { viewPath, fileName, srcType, savePath } = await FileUpload(formData)
        file.message = '上传成功'
        file.status = 'done'
        // file.url = viewPath
        // file.name = `${fileName}.${srcType}`
        file.viewPath = viewPath
        file.savePath = savePath
        file.srcType = srcType
        file.fileName = `${fileName}.${srcType}`
        file.url = viewPath
        delete file.content
        var data = []
        this.fileArr && this.fileArr.map((item) => {
          data.push({
            fileName: item.fileName,
            url: item.viewPath,
            savePath: item.savePath,
            viewPath: item.viewPath,
            srcType: item.srcType
          })
        })
        switch (this._itemField.weakType) {
          case 5: Array.isArray(data) ? data = JSON.stringify(data) : ''; break
          default:break
        }
        // 不要使用watch监听  上传过程中也会变更数据！
        Object.assign(this.itemField, {
          defaultVal: data
        })
        this.changeDefaultVal(data) // 使用success更新数据
      } catch (e) {
        this.fileArr = this.fileArr.filter((item) => item.url)
        console.log(e)
        file.status = 'failed'
        file.message = '上传失败'
      } finally {
        this.itemField.uploadFlag = false // 已完成上传
      }
    },
    /*
    * 超出文件大小后触发
    * */
    async onOversize(file) {
      let maxSize = this._itemField.maxSize / 1024
      maxSize > 1024 ? maxSize = (maxSize / 1024).toFixed(1) + 'MB' : maxSize = maxSize + 'KB'
      this.$toast(`文件大小不能超过${maxSize}`)
    },
    changeValue(val) {
      Array.isArray(val) ? this.fileArr = val : this.fileArr = JSON.parse(val) // 转格式 字符串数组转数组
      this.fileArr?.forEach((res) => { res.viewPath ? res.url = res.viewPath : '' }) // 回显的url处理
    }
  }
}
</script>

<style scoped lang="scss">
  .uploader{
    font-size: 14px;
    background-color: #FFFFFF;
    //.uploader-title{
    //  //width: 100%;
    //  margin-top: 5px;
    //  margin-bottom: 10px
    //}
    .van-uploader{
      margin-top: 5px;
    }
  }
</style>
