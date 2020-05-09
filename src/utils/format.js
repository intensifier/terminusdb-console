import { WOQL_JS, WOQL_JSON, WOQL_PY } from '../labels/queryFormats'
import { QUERY, RULE } from "../labels/tags"
import { isObject } from "../utils/helperFunctions"
const TerminusClient = require('@terminusdb/terminusdb-client');

export const formatQuery = (q, format, mode) => {
    if(!isObject(q)) return;
    var serial = serialise(q, format, mode);
    return serial;
}

const serialise = (q, format, mode) => {
    const View = TerminusClient.View;
    switch(format){
        case WOQL_JS:
            return q.prettyPrint(4);
        case WOQL_JSON:
            if(mode ==  RULE){
                const j = eval(q);
                return JSON.stringify(j.json(), undefined, 2);
            }
            else return JSON.stringify(q.json(), undefined, 2);
        case WOQL_PY:
            return 'something in python'; //not sure what module
    }
}

export const parseText = (text, format, mode) =>{
    const View = TerminusClient.View;
    var view;
    const WOQL = TerminusClient.WOQL;
    switch(format){
        case WOQL_JSON:
            const pText = JSON.parse(text);
            if(mode == QUERY) return WOQL.json(pText);
            else return View.loadConfig(pText);
        case WOQL_JS:
            return eval(text);
    }
}
