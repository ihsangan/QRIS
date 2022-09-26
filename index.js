addEventListener('fetch', event => {
  const { request } = event;
  const { url } = request;
  if (url.includes('submit')) {
    return event.respondWith(new Response(htmlForm, {headers:{"Content-Type":"text/html"}}));
  }
  if (request.method === 'POST') {
    return event.respondWith(handleRequest(request));
  } else if (request.method === 'GET') {
    return event.respondWith(new Response(`The request was a GET`));
  }
});