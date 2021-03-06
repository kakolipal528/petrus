/*
 * Petrus
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 */

const https = require("https")


const { JSDOM } = require("jsdom")

module.exports = class {
  constructor() {} 

  static getBaseUrl() {
    //return 'https://thepiratebay.org'
   // return 'https://thepiratebays.info'
   return 'https://tpb.party'
  }

  static async search(query) {
    const rows = await this.scrap(query)
    return this.parseInfo(rows)
  }

  static getCategory(val) {
    switch (val) {
      case "Music":
        return `0/99/101`
      case "Movies":
        return `0/99/201`
      case "TV shows":
        return `0/99/205`
      case "HD - Movies":
        return `0/99/207`
      case "HD - TV shows":
        return `0/99/208`
      default:
        return `0/7/0`
    }
  }
  //`${this.getBaseUrl()}/search/${showQuery}/${categoryURL}`

  static async scrap(query, category) {
    return new Promise((resolve, reject) => {
      const showQuery = encodeURIComponent(query)
      const categoryURL = this.getCategory(category)

      https
        .get(
          `${this.getBaseUrl()}/search/${showQuery}`,
          response => {
            const { statusCode, statusMessage } = response

            if (statusCode >= 400) {
              reject({ code: statusCode, message: statusMessage })
            } else {
              let dat = ""

              response.on("data", chunk => {
                dat += chunk
                
              })
            
              

              response.on("end", () => {
               
                const fragment = JSDOM.fragment(dat)
                const selector = fragment.querySelectorAll("tr")
                var array = []
               
                for (var i = 0; i < selector.length; i++) {
                  array.push(selector[i].innerHTML)
                }
                

                resolve(array)
              })
            }
          }
        )
        .on("error", e => {
          console.error(e)
          reject(e)
        })
    })
  }

  static getQuality(row) {
    let matchTvShowQuality = /href="\/browse\/205[\S]*"/g.exec(row)
    let matchHdTvShowQuality = /href="\/browse\/208[\S]*"/g.exec(row)

    if (matchTvShowQuality) {
      return `SD`
    }

    if (matchHdTvShowQuality) {
      return `HD`
    }

    return ""
  }

  static parseInfo(rows) {
    var results = rows.map(row => {
      let matchMagnetLink = /href="(magnet:[\S]+)"\s/g.exec(row)
      let matchSeeder = /<td align="right">([\d]+)<\/td>/.exec(row)

      // Return only `Tv Shows` or `HD - Tv Shows`
      // if (matchHdTvShowQuality || matchTvShowQuality) {
      return {
        magnetLink: matchMagnetLink
          ? matchMagnetLink[1].replace(`&amp;`, `&`)
          : null,
          doc : row,
       
     
        seeder: matchSeeder ? parseInt(matchSeeder[1]) : null
      }
      // }
    })

    return results.filter(i => i.magnetLink)
  }
}



