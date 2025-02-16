const isDev = process.env.ELEVENTY_ENV === 'dev';
const isCF = process.env.CF_PAGES == 1;

// !!!
// CHANGE THIS 
// !!!
const targetUrl = 'https://f_city.opaproject.ru';

let baseUrl = isDev ? `http://localhost:8080` : targetUrl;

if (isCF && isDev) {
  baseUrl = process.env.CF_PAGES_URL;
}

const config = {
  name: 'ОПА/f_city',
  lang: 'ru',
  locale: 'ru_RU',
  gtag: 'GTM-5P237L34', // Put Google Tag Manager tag here,like GTM-NQLKKG4
  baseUrl,
  logo: '/icon-512.png',
  social: ["https://www.facebook.com/", "https://instagram.com/"],
  defaultTitle: 'ОПА/f_city',
  defaultDescription: 'Превращаем бетонные коробки в источник дохода',
  defaultImage: '/icon-512.png',
  authorName: 'Света Богданова',
  aboutURL: 'o-nas',
  imageSizes: [300, 600, 900, 1200, 1500, 1800, 2100],

  // Theme
  metaThemeColorLight: "hsl(16, 10%, 93%)",
  metaThemeColorDark: "hsl(16, 5%, 10%)",
};

export default config;