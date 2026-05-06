import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "../components/Header";
import ReaderPicker from "../components/ReaderPicker";

export const metadata: Metadata = {
  title: "Chronicle — Personalized News",
  description:
    "Chronicle aggregates news from BBC, Reuters, the Guardian, TechCrunch and more, personalized for you."
};

const LAUNCH_URL = process.env.NEXT_PUBLIC_LAUNCH_URL || "";

const PRE_HIDING = `
;(function(g,b,d,f){
  (function(a,c,d,e){
    if(a.style){a.style.cssText=c+' '+d;}
    var f=b.getElementsByTagName(d)[0],s=b.createElement(d);
    s.id=e;s.innerText=c;f.parentNode.insertBefore(s,f);
  })(b.documentElement,'body { opacity: 0 !important }',d,f);
  setTimeout(function(){
    var n=b.getElementById(f);
    if(n){n.parentNode.removeChild(n);}
  },g);
})(3000,document,'style','at-body-style');
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_HIDING }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.chronicleData = window.chronicleData || {};
              window.targetPageParams = function() {
                var d = window.chronicleData || {};
                var params = {};
                ${process.env.NEXT_PUBLIC_TARGET_PROPERTY ? `params["at_property"] = "${process.env.NEXT_PUBLIC_TARGET_PROPERTY}";` : ""}
                if (d.page) {
                  params["page.type"] = d.page.type;
                  params["page.category"] = d.page.category || "";
                }
                if (d.article) {
                  params["entity.id"] = d.article.id;
                  params["entity.categoryId"] = d.article.category;
                  params["entity.name"] = d.article.title || "";
                  params["article.id"] = d.article.id;
                  params["article.category"] = d.article.category;
                  params["article.source"] = d.article.source;
                }
                return params;
              };
            `
          }}
        />
        {LAUNCH_URL && (
          <Script src={LAUNCH_URL} strategy="afterInteractive" async />
        )}
      </head>
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-[var(--line)] mt-16 py-8 text-sm text-[var(--muted)]">
          <div className="max-w-6xl mx-auto px-4">
            Chronicle is a demo aggregator. Articles link back to their original
            publishers.
          </div>
        </footer>
        <ReaderPicker />
      </body>
    </html>
  );
}
