const server = process.env.TERMINUSDB_SERVER || `${window.location.protocol}//${window.location.host}`

const TERMINUSDB=window.TERMINUSDB || {}
const user0bj=TERMINUSDB.user || {}

let key=process.env.TERMINUSDB_KEY || user0bj.password 

const userName=process.env.TERMINUSDB_USER || user0bj.username || 'admin'

const hub_url = process.env.TERMINUS_HUB_URL || "https://hub.terminusdb.com/" 
const bff_url = process.env.TERMINUS_BFF_URL || "https://terminusdb.com/" 

if(!key){
	key=window.sessionStorage.getItem("apiKey");
}

console.log("__SERVER___",server);

export const localSettings = {server : server, key : key, user: userName, remote: hub_url, bff: bff_url}

