## footer-page 方法参数说明
```html
<!-- 底部分页 -->
<footer-page
  slot="footer"
  ref="footerPage"
  :page-size="pageSize"
  :current-page="currentPage"
  :total="total"
  :small="true"
  layout="sizes, prev, pager, next, jumper"
  class="d2-mt-20"
  @handleSizeChange="handleSizeChange"
  @handleCurrentChange="handleCurrentChange"
/>
```
