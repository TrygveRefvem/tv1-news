/* eslint-disable no-undef */
const url = `http://api.mediastack.com/v1/news`;

export function getNews() {
  const params = {
    languages: 'en',
    countries: 'us,il,ae',
    access_key: import.meta.env.VITE_MEDIASTACK_API_KEY,
    // access_key: '7171c426ae28f45bc0d80bb802c0afb8',
    keywords: 'israel,palestine',
    limit: 25,
  };

  const urlParams = new URLSearchParams(params).toString();

  const cacheKey = `${url}?${urlParams}`;
  const cacheExpiryKey = `newsCacheExpiry_${urlParams}`;

  const cachedData = localStorage.getItem(cacheKey);
  const cacheExpiry = localStorage.getItem(cacheExpiryKey);

  const now = new Date().getTime();
  if (cachedData && cacheExpiry && now < parseInt(cacheExpiry, 10)) {
    console.log('Using cached data...');
    return Promise.resolve(JSON.parse(cachedData));
  }

  console.log('Fetching fresh data...');
  return fetch(`${url}?${urlParams}`)
    .then((res) => res.json())
    .then((res) => {
      localStorage.setItem(cacheKey, JSON.stringify(res));
      localStorage.setItem(cacheExpiryKey, now + 3600000);
      return res;
    });
}
