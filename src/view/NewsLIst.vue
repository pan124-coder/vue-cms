<script setup lang="ts">
import {onMounted} from "vue";
import {auditPass, auditReject, deletenews, type newsData, newsList, saveNews, updateNews, getNewsById, type NewsList} from "@/http/news.ts";
import '@wangeditor/editor/dist/css/style.css'
import {onBeforeUnmount, ref, shallowRef} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue';

const getStatusText = (status: string) => {
  switch(status) {
    case 'PENDING_REVIEW': return '待审核';
    case 'PUBLISHED': return '已发布';
    case 'REJECTED': return '已驳回';
    default: return status;
  }
};

const currentPage=ref(1);
const newsListData=ref<NewsList[]>([]);

const striHtml=(html: string)=>{
  return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g,'')
      .replace(/\s+/g,' ')
      .trim()
}

const isHide = ref(true);
const isEditMode = ref(false)
const editNewsId = ref<number | null>(null)

const openAuthDialog = async (isEdit=false, row?: NewsList) => {
  isEditMode.value = isEdit
  isHide.value =false
  if (isEdit && row){
    editNewsId.value = row.id
    newsTitle.value = row.title
    newsType.value = row.category
    newssuplier.value = row.supplier
    newsreviewer.value = row.reviewer
    try {
      const res = await getNewsById(row.id)
      if (res && res.data) {
        valueHtml.value = res.data.content
      } else {
        valueHtml.value = row.content
      }
    } catch (err) {
      console.error("获取新闻详情失败", err)
      valueHtml.value = row.content
    }
  } else {
    editNewsId.value = null
    newsTitle.value = ''
    newsType.value = ''
    newssuplier.value = ''
    newsreviewer.value = ''
    valueHtml.value = ''
  }
}

const closeAuthDialog = () => {
  isHide.value = true;
}

const totalNum=ref<number>(0);

const getNewsList = async () => {
  const { total, totalPage, data } = await newsList(currentPage.value, 3);
  totalNum.value = totalPage;

  newsListData.value = data.map((news: NewsList) => {
    news.content = striHtml(news.content);
    if (news.content.length > 60) {
      news.content = news.content.substring(0, 60) + "...";
    }
    return news;
  });
};

onMounted(async () => {
  await getNewsList();
  console.log(newsListData);
});

const prev = async () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    await getNewsList();
  }
};

const next = async () => {
  if (currentPage.value < totalNum.value) {
    currentPage.value++;
    await getNewsList();
  }
}

const goFirst = async () => {
  currentPage.value = 1
  await getNewsList()
}

const goLast = async () => {
  currentPage.value = totalNum.value
  await getNewsList()
}

const Handledeletenews = async (id: number) => {
  if (!confirm('确定要删除该新闻吗？')) return
  await deletenews(id)
  getNewsList()
}

const handleAuditPass = async (id: number) => {
  if (!confirm('确定要通过该新闻审核吗？')) return
  try {
    await auditPass(id)
    alert("审核通过成功！")
    getNewsList()
  } catch (err) {
    console.error("审核通过失败", err)
    alert("审核通过失败，请重试")
  }
}

const handleAuditReject = async (id: number) => {
  if (!confirm('确定要驳回该新闻吗？')) return
  try {
    await auditReject(id)
    alert("已驳回该新闻！")
    getNewsList()
  } catch (err) {
    console.error("驳回失败", err)
    alert("驳回失败，请重试")
  }
}

const editorRef = shallowRef()
const toolbarConfig = {}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const mode = ref("default")
const valueHtml = ref<string>('')

interface MenuConfig {
  [key: string]: any
}

const editorConfig = {
  placeholder: '请输入内容......',
  MENU_CONF: {} as MenuConfig
}

const handleCreated = (editor: any) => {
  editorRef.value = editor
}

const newsType = ref<string>('');
const newsTitle = ref<string>('');
const newssuplier = ref<string>('');
const newsreviewer = ref<string>('');
const showSuccess = ref(false);

const handlsaveNews = async () => {
  if (!newsTitle.value || !newsType.value || !valueHtml.value) {
    alert("标题、栏目、正文不能为空！");
    return;
  }
  const params: newsData = {
    category: newsType.value,
    title: newsTitle.value,
    content: valueHtml.value,
    supplier: newssuplier.value,
    reviewer: newsreviewer.value,
  }
  try{
    if (editNewsId.value) {
      await updateNews(editNewsId.value, params)
    } else {
      await saveNews(params)
    }
    alert("保存成功");
    setTimeout(() => {
      showSuccess.value = false;
      closeAuthDialog();
      getNewsList();
    }, 1500);
  } catch (err) {
    console.error("保存失败", err);
    alert("保存失败，请重试");
  }
}

editorConfig.MENU_CONF['uploadImage'] = {
  server: 'http://106.55.59.209:8081/api/news/uploadImg',
  fieldName: 'your-custom-name',
  maxFileSize: 20 * 1024 * 1024,
  maxNumberOfFiles: 5,
  allowedFileTypes: ['image/*'],
  timeout: 5 * 1000,
}
</script>

<template>
  <div>
    <p>新闻管理</p>
    <button @click="openAuthDialog(false)" v-permission="['content:news:add']">新建新闻</button>
  </div>
  <div>

    <table>
      <tr>
        <th>新闻标题</th>
        <th>栏目</th>
        <th>正文</th>
        <th>供稿</th>
        <th>审核</th>
        <th>状态</th>
        <th>发布时间</th>
        <th>操作</th>
        <th>审核</th>
      </tr>
      <tr v-for="news in newsListData " :key="news.id">
        <td>{{news.title}}</td>
        <td>{{news.category}}</td>
        <td>{{news.content}}</td>
        <td>{{news.supplier}}</td>
        <td>{{news.reviewer}}</td>
        <td>{{getStatusText(news.status)}}</td>
        <td>{{news.publishTime}}</td>
        <td>
          <button @click="openAuthDialog(true,news)" v-permission="['content:news:edit']">编辑</button>
          <button @click="Handledeletenews(news.id)" v-permission="['content:news:delete']">删除</button>
        </td>
        <td>
          <button @click="handleAuditPass(news.id)" v-permission="['content:news:audit']" :disabled="news.status!=='PENDING_REVIEW'">通过</button>
          <button @click="handleAuditReject(news.id)" v-permission="['content:news:audit']" :disabled="news.status!=='PENDING_REVIEW'">驳回</button>
        </td>
      </tr>
    </table>

    <div style="float: right;position: relative;margin-top: 200px">
      共{{totalNum}}页
      <button @click="goFirst" :disabled="currentPage==1">首页</button>
      <button @click="prev" :disabled="currentPage==1">上一页</button>
      <button @click="next" :disabled="currentPage==totalNum">下一页</button>
      <button @click="goLast" :disabled="currentPage==totalNum">尾页</button>
    </div>

    <!-- 遮罩层（初始隐藏） -->
    <div id="rbacModal" class="rbac-modal-overlay" :class="{modelHide: isHide}" @click.self="closeAuthDialog">
      <div class="rbac-modal-content" id="modalContent">
        <span class="rbac-modal-close" id="closeModal" @click="closeAuthDialog">&times;</span>
        <!-- 这里放你的授权表单或内容 -->
        <!--      <div style="padding: 20px; height: 100%; box-sizing: border-box;"@click.stop>-->
        <div style="padding: 20px; height: 100%; box-sizing: border-box;">
          <h2>{{ isEditMode ? '编辑新闻' : '添加新闻' }}</h2>
          <div>
            新闻标题：<input type="text" v-model="newsTitle">
            栏目：
            <select v-model="newsType">
              <option value="学院新闻">学院新闻</option>
              <option value="通知公告">通知公告</option>
              <option value="学术活动">学术活动</option>
              <option value="学工新闻">学工新闻</option>
              <option value="党建工作">党建工作</option>
            </select>
            供稿：<input type="text" v-model="newssuplier">
            审核：<input type="text" v-model="newsreviewer">
          </div>
          <div style="border: 1px solid #ccc;height: 600px;">
            <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
            />
            <Editor
                style="height: 500px;"
                v-model="valueHtml"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
            />
          </div>
          <div>
            <button @click="handlsaveNews">保存新闻</button>
          </div>

        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
table,tr,th,td{
  border-collapse: collapse;
  border: 1px solid black;
}


/* 遮罩层容器 */
.rbac-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 遮罩内容区 */
.rbac-modal-content {
  width: 900px;
  height: 750px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

/* 关闭按钮示例（可选） */
.rbac-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  font-size: 20px;
  color: #999;
}

.modelHide {
  display: none;
}


</style>
