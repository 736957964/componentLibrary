export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isShow: false,
      // 提交按钮loading
      btnLoading: false,
      // 面板loading
      wrapperLoading: false
    }
  },
  methods: {
    /**
     * 关闭弹窗
     */
    close() {
      // 添加其他的数据处理
      this.resetData && this.resetData()
      this.$refs.ruleForm && this.$refs.ruleForm.resetFields()
      this.isShow = false
      this.$emit('update:dialogVisible', false)
    },
    /**
     * 提交数据  点击确定的时候调用 submitData 表单验证没问题就会触发doSubmit
     */
    submitData() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.btnLoading = true
          this.doSubmit()
        } else {
          this.btnLoading = false
          return false
        }
      })
    },
    /**
     * 提交数据、关闭弹窗
     */
    doEmitAndClose(val) {
      this.$emit('success', val)
      this.close()
    },
    /**
     * 操作成功的封装
     */
    operationSuccess(msg) {
      this.$message.success(msg)
      this.$emit('success')
      this.close()
    }
  },
  watch: {
    dialogVisible(val) {
      // 用来监听父组件的 dialogVisible 是否修改 以此来判断隐藏还是显示
      if (val) {
        this.initForm && this.initForm()
      } else {
        this.otherOperations && this.otherOperations()
        // 重置data中的数据到最原始状态
        Object.assign(this.$data, this.$options.data())
      }
    }
  }
}
