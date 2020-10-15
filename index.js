// Initialize link array and variables
linkArray = [{ "name": "Google", "url": "https://www.google.com" },
                 { "name": "Youtube", "url": "https://youtube.com" },
                 { "name": "Cloudfare", "url": "https://www.cloudflare.com" }]
                 
const url = "https://mohamedhamidi.mhamidi.workers.dev"
const linkurl = url + "/links"
const fetchurl = "https://static-links-page.signalnerve.workers.dev"

addEventListener("fetch", event => {
  return event.respondWith(handleRequest(event.request))
})

// Handle /links path and other paths (main website)
async function handleRequest(request) {
  // Set headers
  const init = {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  }
  // Create json for link array
  const json = JSON.stringify(linkArray, null, 2)
  if(request.url == linkurl) {
    return new Response(json, init)
  }
  else {
    const init = {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    }
    // Fetch and retrieve html page
    const response = await fetch(fetchurl, init)
    const results = await gatherResponse(response)
    // Use HTMLRewriter to rewrite the page
    const final = new HTMLRewriter()
    .on('div#links', new LinksTransformer(linkArray))
    .on('div#profile', new AttributeRewriter("style"))
    .on('img#avatar', new AttributeRewriter("src"))
    .on('h1#name', new AttributeRewriter("text"))
    return final.transform(new Response(results,init))
  }   
}

async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get("content-type") || ""
  // If /links, return json response
  if (contentType.includes("application/json")) {
    return JSON.stringify(await response.json())
  }
  else {
    return await response.text()
  }
}

// Set Links
class LinksTransformer {
  constructor(links) {
    this.links = links
  }
  async element(element) {
    if (this.links) {
      // Print out the links from the linkarray
      for(var i = 0; i < this.links.length; ++i) {
        element.append("<br/><a href=" + this.links[i].url + ">"
          + this.links[i].name + "</a>",{ html: true })
      }
    }
  }
}

// Rewrite Image and Username
class AttributeRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName
  }
  element(element) {
    const attribute = element.getAttribute(this.attributeName)
    // Remove display: none
    if(this.attributeName == "style") {
      element.setAttribute(
        this.attributeName,
        attribute.replace("display: none", ""),
      )
    }
    // Add profile image
    else if(this.attributeName == "src") {  
      element.setAttribute(
        this.attributeName,
        "https://avatars2.githubusercontent.com/u/58640912?s=400&u=455a6247186fd9aa15f33477ad15821509ae74b5&v=4")
    }
    // Add username
    else if(this.attributeName == "text") {
      element.append("mohamidi")
    }
  } 
}