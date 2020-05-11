import React, { useState, useEffect } from "react";
import { Container } from "reactstrap";

//allows multiple resultviews to exist together

export const ResultPane = ({bindings, query, report, children, updateQuery}) => {
    
    //const [currentViews, setViews] = useState(views)


    const elements = React.Children.toArray(children) ;	
    const childrenEl = elements.map((child)=>{
        return React.cloneElement(child, { 
            updateQuery:updateQuery,
            report:report,
            query:query, 
            bindings:bindings
        })
    })
    return (
        <Container>
            {childrenEl}
        </Container>                
    )
}
