import Document, { Head, Html, Main, NextScript } from "next/document"

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang="en" className="h-full">
        <Head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+xml" />
          <link href="/site.webmanifest" rel="manifest" />
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        </Head>
        <body className="h-full">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
