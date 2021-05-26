// 项目发布阶段需要用到的Babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 项目发布时的插件数组
    ...prodPlugins,
    //  路由懒加载
    '@babel/plugin-syntax-dynamic-import'
  ]
}
