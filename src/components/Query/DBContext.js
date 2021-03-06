import React, {useState, useEffect, useContext} from 'react'
import TerminusClient from '@terminusdb/terminusdb-client'
import {TERMINUS_ERROR} from '../../constants/identifiers'

export const DBContext = React.createContext()
export const DBContextObj = () => useContext(DBContext)

export const DBContextProvider = ({children, woqlClient}) => {
    if (!woqlClient.db()) {
        return (
            <DBContext.Provider value={NullDBProvider(woqlClient)}>
                {children}
            </DBContext.Provider>
        )
    }
    if (woqlClient.db() == '_system') {
        return (
            <DBContext.Provider value={TerminusDBProvider(woqlClient)}>
                {children}
            </DBContext.Provider>
        )
    }
    const [branches, setBranches] = useState()
    const [graphs, setGraphs] = useState()
    const [DBInfo, setDBInfo] = useState()
    const [branch, setBranch] = useState(woqlClient.checkout())
    const [prefixes, setPrefixes] = useState()
    const [repos, setRepos] = useState()

    const [ref, setRef] = useState(woqlClient.ref())

    const [consoleTime, setConsoleTime] = useState()

    const [report, setReport] = useState()
    const [loading, setLoading] = useState(0)
    const [headUpdating, setHeadUpdating] = useState(false)
    const [reposReload, setReposReload] = useState(0)
    const [graphsReload, setGraphsReload] = useState(0)
    const [branchesReload, setBranchesReload] = useState(0)
    const [prefixesReload, setPrefixesReload] = useState(0)
    const [prefixesLoaded, setPrefixesLoaded] = useState(false)

    const WOQL = TerminusClient.WOQL

    /*
    * I load the branch list, will be update if I add a new branch
    */
    useEffect(() => {
        setLoading(loading + 1)
        WOQL.lib()
            .branches()
            .execute(woqlClient)
            .then((res) => {
                let binds = res && res.bindings ? branchStructureFromBindings(res.bindings) : []
                setBranches(binds)
            })
            .catch((e) => {
                setReport({error: e, status: TERMINUS_ERROR})
            })
            .finally(() => setLoading(loading - 1))
    }, [branchesReload])

    //load db info
    useEffect(() => {
        setLoading(loading + 1)
        WOQL.lib()
            .first_commit()
            .execute(woqlClient)
            .then((res) => {
                let binds = res && res.bindings ? dbStructureFromBindings(res.bindings) : []
                setDBInfo(binds)
            })
            .catch((e) => {
                setReport({error: e, status: TERMINUS_ERROR})
            })
            .finally(() => setLoading(loading - 1))
    }, [])

    //load Prefixes
    useEffect(() => {
        setPrefixes()
        setLoading(loading + 1)
        WOQL.lib()
            .prefixes()
            .execute(woqlClient)
            .then((res) => {
                let binds = res && res.bindings ? res.bindings : []
                setPrefixes(binds)
            })
            .catch((e) => {
                setReport({error: e, status: TERMINUS_ERROR})
            })
            .finally(() => setLoading(loading - 1))
    }, [branchesReload, prefixesReload])

    //update Prefixes
    useEffect(() => {
        if(prefixes){
            _do_update_prefixes(prefixes)
        }
    }, [prefixes])


    function _do_update_prefixes(prefixes){
        let nups = {}
        for(var i = 0; i<prefixes.length; i++){
            if(prefixes[i]['Prefix'] && prefixes[i]['Prefix']['@value'] && prefixes[i]['IRI'] && prefixes[i]['IRI']["@value"]){
                nups[prefixes[i]['Prefix']['@value']] = prefixes[i]['IRI']["@value"]
                TerminusClient.UTILS.addURLPrefix(prefixes[i]['Prefix']['@value'], prefixes[i]['IRI']["@value"])
            }
        }
        woqlClient.connection.updateDatabasePrefixes(woqlClient.databaseInfo(), nups)
        setPrefixesLoaded(true)
    }


    //load graph structure
    useEffect(() => {
        setLoading(loading + 1)
        let constraint = WOQL.query()
        if (woqlClient.ref()) {
            constraint.eq('v:Commit ID', woqlClient.ref())
        } else {
            constraint.eq('v:Branch ID', woqlClient.checkout())
        }
        WOQL.lib()
            .graphs(constraint)
            .execute(woqlClient)
            .then((res) => {
                let binds = res && res.bindings ? graphStructureFromBindings(res.bindings) : []
                setGraphs(binds)
            })
            .catch((e) => {
                setReport({error: e, status: TERMINUS_ERROR})
            })
            .finally(() => setLoading(loading - 1))
    }, [branch, ref, branches, graphsReload])

    //load Repo
    useEffect(() => {
        if(branches){
            setLoading(loading + 1)
            let cresource = woqlClient.resource('meta')
            WOQL.lib()
                .repos(false, false, cresource)
                .execute(woqlClient)
                .then((res) => {
                    let binds = res && res.bindings ? ReposFromBindings(res.bindings) : []
                    setRepos(binds)
                })
                .catch((e) => {
                    setReport({error: e, status: TERMINUS_ERROR})
                })
                .finally(() => setLoading(loading - 1))
        }
    }, [branches, reposReload])



    function setHead(branchID, refObject={}){// ridConsoleTime=false) {
        woqlClient.checkout(branchID)
        let sref=refObject.commit;
        let refTime=refObject.time;

        //alert(branch + " => " + branchID + " ref: " + ref + " => " + sref + " " + consoleTime)

        if(branches && branches[branchID] && branches[branchID].head == sref){
            sref = false
            refTime=false
        }
        sref = sref || false
        woqlClient.ref(sref)
       /*
       to be review
       remove consoleTime and ref and leave only refObject ????;
       */
        setBranch(branchID)
        setRef(sref);
        setConsoleTime(refTime)
    }


    function updateBranches(bid) {
        if(bid) {
            setBranch(bid)
            woqlClient.ref(false)
            woqlClient.checkout(bid)
        }
        setBranchesReload(branchesReload + 1)
    }

    function updatePrefixes() {
        setPrefixesReload(prefixesReload + 1)
    }


    function updateRepos(){
        setReposReload(reposReload + 1)
    }

    function updateGraphs(){
        setGraphsReload(graphsReload + 1)
    }

    function dbStructureFromBindings(bindings) {
        let info = {}
        if (bindings && bindings[0] && bindings[0]['Time']) {
            info.created = bindings[0]['Time']['@value']
        } else {
            info.created = 0
        }
        info.author = bindings[0] && bindings[0]['Author'] ? bindings[0]['Author']['@value'] : ''
        return info
    }

    function isLocalClone(url) {
        if (woqlClient.server() == url.substring(0, woqlClient.server().length)) return true
        return false
    }

    function ReposFromBindings(bindings) {
        let repos = {}
        for (var i = 0; i < bindings.length; i++) {
            let b = bindings[i]
            if(b['Repository Name'] && b['Repository Name']['@value']){
                let title = b['Repository Name']['@value']
                if(repos[title]){
                    title += i
                }
                if (b['Remote URL'] && b['Remote URL']['@value']) {
                    repos[title] = {
                        url: b['Remote URL']['@value'],
                        title: title,
                    }
                }
                else {
                    repos.local = {
                        title: 'local'
                    }
                }
            }
        }
        return repos
    }

    function branchStructureFromBindings(bindings) {
        let brans = {}
        for (var i = 0; i < bindings.length; i++) {
            brans[bindings[i]['Branch ID']['@value']] = {
                id: bindings[i]['Branch ID']['@value'],
                head: bindings[i]['Commit ID']['@value'],
                updated: bindings[i]['Time']['@value'],
            }
        }
        return brans
    }

    function graphStructureFromBindings(bindings) {
        let gs = {}
        for (var i = 0; i < bindings.length; i++) {
            let fid = `${bindings[i]['Graph Type']['@value']}/${bindings[i]['Graph ID']['@value']}`
            gs[fid] = {
                id: bindings[i]['Graph ID']['@value'],
                type: bindings[i]['Graph Type']['@value'],
            }
        }
        return gs
    }


    return (
        <DBContext.Provider
            value={{
                setConsoleTime,
                setHead,
                updateBranches,
                updateRepos,
                updateGraphs,
                updatePrefixes,
                consoleTime,
                DBInfo,
                branches,
                graphs,
                report,
                branch,
                ref,
                repos,
                prefixes,
                loading,
                prefixesLoaded
            }}
        >
            {children}
        </DBContext.Provider>
    )
}

/**
 * Creates a prebaked context for the terminusdb situation
 * where we have no commits or meta graph and a pre-ordained set of graphs that cannot be changed
 */
export const TerminusDBProvider = (woqlClient) => {
    let branches = false
    let graphs = {
        'schema/main': {type: 'schema', id: 'main'},
        'inference/main': {type: 'inference', id: 'main'},
        'instance/main': {type: 'instance', id: 'main'},
    }
    let DBInfo = {created: 0}
    function setHead() {}
    function setConsoleTime() {}
    function updateBranches() {}
    let report = false
    let branch = false
    let ref = false
    let loading = false
    let consoleTime = false
    let prefixesLoaded = true
    let prefixes = []
    let refObject = false

    return {
        setConsoleTime,
        setHead,
        updateBranches,
        consoleTime,
        DBInfo,
        branches,
        prefixes,
        graphs,
        report,
        ref,
        branch,
        refObject,
        loading,
        prefixesLoaded,
    }
}

export const NullDBProvider = (woqlClient) => {
    let branches = false
    let graphs = false
    let DBInfo = {created: 0}
    function setHead() {}
    function setConsoleTime() {}
    function updateBranches() {}
    let report = false
    let branch = false
    let ref = false
    let loading = false
    let consoleTime = false
    let prefixes = []
    let prefixesLoaded = true
    return {
        setConsoleTime,
        setHead,
        updateBranches,
        DBInfo,
        branches,
        prefixes,
        graphs,
        report,
        branch,
        consoleTime,
        ref,
        loading,
        prefixesLoaded
    }

}
