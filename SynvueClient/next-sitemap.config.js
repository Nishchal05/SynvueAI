/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://synvueai.in', // your domain
    generateRobotsTxt: true, // generates robots.txt as well
    sitemapSize: 5000,       // optional: splits sitemap if too large
  };
  