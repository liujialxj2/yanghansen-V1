/**
 * 结构化数据组件 - 帮助Google更好地理解网站内容
 */

export function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Yang Hansen",
    "alternateName": "杨瀚森",
    "description": "NBA Portland Trail Blazers Center, Rising Chinese Basketball Star",
    "nationality": "Chinese",
    "birthPlace": "China",
    "height": "7'3\" (2.21m)",
    "weight": "250 lbs (113 kg)",
    "jobTitle": "Professional Basketball Player",
    "memberOf": {
      "@type": "SportsTeam",
      "name": "Portland Trail Blazers",
      "sport": "Basketball",
      "league": "NBA"
    },
    "sport": "Basketball",
    "url": "https://yanghansen.blog",
    "sameAs": [
      "https://yanghansen.blog"
    ],
    "image": "https://yanghansen.blog/favicon.svg"
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Yang Hansen Official Website",
    "alternateName": "杨瀚森官方网站",
    "description": "Yang Hansen Official Website - Portland Trail Blazers Center, Rising Chinese NBA Star. Latest news, stats, videos and career highlights.",
    "url": "https://yanghansen.blog",
    "inLanguage": ["en", "zh"],
    "about": {
      "@type": "Person",
      "name": "Yang Hansen"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Yang Hansen Official",
      "url": "https://yanghansen.blog"
    }
  }

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Yang Hansen Official",
    "description": "Official website and digital presence of NBA player Yang Hansen",
    "url": "https://yanghansen.blog",
    "logo": "https://yanghansen.blog/favicon.svg",
    "sameAs": [
      "https://yanghansen.blog"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
    </>
  )
}