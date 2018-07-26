declare type OpenOptions = (
  // 窗口id
  windowId?: string,
  // 标题
  title?: string,
  // 路径
  src: string,
  // 类型
  type?: string,
  // 任务栏窗口id
  taskId?: string,
  // 是否有任务栏
  isTasks: boolean,
  // 是否可以关闭
  closable: boolean,
  // 是否可以刷新
  refreshable: boolean,
  // 是否已经初始化
  init: boolean,
  // 是否正在移除中
  removeing: boolean,
  // 窗口
  contentWindow: null,
  // 是否有窗口
  hasContentWindow: boolean,
  // main
  $main: null,
  $mainContent: null,
  $mainWrap: {},
  $parent: null,
  $iframe: null,
  $mainComponent: null
) => any

declare type Dictionary < T > = {
  [key: string]: T
}
