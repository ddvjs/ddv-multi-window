export default function () {
  return {
    // 路径
    src: '/',
    // 标题
    title: 'New window',
    // 是否可以关闭
    closable: true,
    // 是否可以刷新
    refreshable: true,
    // 是否正在移除中
    removeing: false,
    // 窗口
    contentWindow: null,
    // 视图的 可拖动的dom，是一个属性不变的jquery dom - 注意，不能去改变属性，避免vue重新渲染
    $content: null,
    // iframe 的 jquery
    $iframe: null,
    // 视图的 父层 jquery dom 不会改变，第一次的父层 - 注意，不能去改变属性，避免vue重新渲染
    $parent: null,
    // 注入到那个具体窗口的容器
    $mainWrap: {},
    hook: {
      beforeRefresh: []
    },
    // 组件
    component: null
  }
}
