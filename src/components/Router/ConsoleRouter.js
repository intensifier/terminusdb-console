import React from 'react'
import {createBrowserHistory} from "history"
import {DB_ROUTE, CLONE_DB_ROUTE, SERVER_ROUTE, TERMINUS_ROUTE} from '../../constants/routes'
import {Router, Switch, Route,Redirect} from 'react-router-dom'
import {DBRoutes} from './DBRoutes'
//import {ProfileRoutes} from './ProfileRoutes'
import {ServerRoutes} from './ServerRoutes'
import {base_router} from '../../utils/baseRouter'
import {Footer} from '../../views/Templates/Footer'
import { ConsoleNavbar } from "../../components/Navbar/ConsoleNavbar";

export const ConsoleHistory= createBrowserHistory({basename: base_router});

export const ConsoleRouter = (props) => {
    function getSwitch() {
        return (
            <Switch>
                <Route path={DB_ROUTE}>
                    <DBRoutes />
                </Route>
                <ServerRoutes />
                <Route path="/not-found" component={Notfound} />
                <Route path="*">
                    <Redirect to="/not-found" />
                </Route>                
            </Switch>
        )
    }
    return <Router history={props.history}>
                    {getSwitch()}
            
            </Router>
}
//<Footer/>

const Notfound = ()=>{
    return <div>NOT FOUND!!!!!!!</div>
}
/*
* for page navigation, create dinamically the /db/username/dbname
*/
export const getDBRoute = (db, aid) => {
    if (db == '_system') return DB_ROUTE + TERMINUS_ROUTE
    return `${DB_ROUTE}/${aid}/${db}`
}

export const getHubRoute = (orgid, dbid) => {
    let base = `${CLONE_DB_ROUTE}`
    if(orgid) base += `/${orgid}`
    if(dbid) base += `/${dbid}`
    return base
}

export const goHubPage = (org, dbid, report) => {
    let route = getHubRoute(org, dbid)
    goTo(route, report)
}


export const getDBPageRoute = (db, aid, page) => {
    return getDBRoute(db, aid) + `/${page}`
}

export const getDBSubpageRoute = (db, aid, page, subpage) => {
    return getDBPageRoute(db, aid, page) + `/${subpage}`
}

export const goTo = (route, report) => {
    if (report) ConsoleHistory.push({pathname: route, state: {report: report}})
    else ConsoleHistory.push(route)
}

export const goServerHome = (report) => {
    goTo(SERVER_ROUTE, report)
}

export const goDBHome = (db, aid, report) => {
    let route = getDBRoute(db, aid)
    goTo(route, report)
}

export const goDBPage = (db, aid, page, report) => {
    let route = getDBPageRoute(db, aid, page)
    goTo(route, report)
}

export const goDBSubPage = (db, aid, page, subpage, report) => {
    let route = getDBSubpageRoute(db, aid, page, subpage)
    goTo(route, report)
}
