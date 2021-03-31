import bs from 'browser-sync'

export default (options: { name: string, config: string }) =>{
  return () => {
    if (process.env.METALSMITH_WATCH && !bs.has(options.name)) {
      bs.create(options.name).init(options.config)
    }
  };
}
