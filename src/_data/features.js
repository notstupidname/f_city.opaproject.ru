const features = {
  devMode: process.env.ELEVENTY_ENV === 'dev',
  showDrafts: process.env.DRAFTS === 'show'
}

export default features;