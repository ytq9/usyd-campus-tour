declare module 'pannellum/build/pannellum.css' {
  const content: string
  export default content
}

declare module 'pannellum/build/pannellum.js' {
  const pannellum: any
  export default pannellum
}

interface Window {
  pannellum: any
  pannellumViewer: any
}
