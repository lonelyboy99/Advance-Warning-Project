<template>
  <div v-if="visible" class="modal-overlay">
      <div class="modal-content" :style="{ width: '100%', height: '100%' }">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <div class="chart-link" @click="closeModal">关闭</div>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '弹窗标题',
    },
    width: {
      type: String,
      default: '80%', // 默认宽度
    },
    height: {
      type: String,
      default: '80%', // 默认高度
    },
  },
  computed: {
    modalWidth() {
      return this.width;
    },
    modalHeight() {
      return this.height;
    },
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 50% 透明的黑色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: rgba(34, 34, 34, 0.9); /* 深色背景，90% 不透明度 */
  padding: 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #ffffff; /* 白色文字 */
}
h3{
  font-size: 30px;
}
.chart-link { /* 放大查看图表的文字链接样式 */
  bottom: 7px; /* 距离底部10px */
  right: 10px; /* 距离右边10px */
  color: #FFFFFF; /* 文字颜色 */
  cursor: pointer; /* 鼠标悬停时显示指针 */
  font-size: 30px; /* 文字大小 */

  &:hover {
    color: #2980b9; /* 悬停时的颜色 */
  }
}
.modal-body {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  color: #ffffff; /* 白色文字 */
}
</style>
