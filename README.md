## 模型缓存策略

> 模型采用indexedDB缓存, 初次加载后, 会将所有模型数据缓存到用户本地, 下次加载时, 会优先读取缓存, 减少网络请求次数, 如需修改模型, 则需要同步修改`src/constants/index.ts`中的缓存版本号: `MODEL_CACHE_VERSION`

## 回放缓存策略

TODO:
