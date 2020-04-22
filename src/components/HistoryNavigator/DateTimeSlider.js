import React, { useState, useEffect } from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { SliderRail, Handle, Track, Tick } from "./SliderComponents";
import { subDays, startOfToday, format, startOfDay } from "date-fns";
import { scaleTime } from "d3-scale";

export const DateTimeSlider = (props) => {
    const [selectedTime, setSelected] = useState(props.current);
    const [updatedTime, setUpdated] = useState(props.updated);
    const [min, setMin] = useState(props.start);
    const [max, setMax] = useState(props.end);
    const sliderStyle = {position: "relative",
                         width: "100%"};
    function formatTick(ms) {
      return format(new Date(ms), "dd MMM yyyy");
    }

    useEffect(() => {
        if(props.current) setSelected(props.current) 
        if(props.updated) setUpdated(props.updated)
        if(props.start) setMin(props.start)
        if(props.end) setMax(props.end) 
    }, [props])



    const halfHour = 1000 * 60 * 30;

    function tsToDate(ts){
      if (isNaN(parseFloat(ts))) return "NaN";
      return new Date(parseFloat(ts*1000))
    }

    const onUpdate = ([ms]) => {
        if (isNaN(parseFloat(ms))) return;
        if(Math.floor(props.current) != Math.floor(ms/1000)){
           props.onChange(ms/1000)
        }
    };

    const dateTicks = scaleTime()
      .domain([tsToDate(min), tsToDate(max)])
      .ticks(8)
      .map(d => +d);

    const renderDateTime = (ts, header) => {
      if(ts){
          let dd = tsToDate(ts)
          return (
              <div style={{ width: "100%",
                  textAlign: "center",
                  fontFamily: "Arial",
                  display: "flex",
                  margin: '5px 40px 0px 0px'}}>
              <b>{header}:</b>
              <div style={{ fontSize: 12, margin: '3px 0px 0px 10px'}}>{format(dd, "yyyy MM dd h:mm a")}</div>
            </div>
          )
        }
        return ( <span/> )
    }

    return (
      <div>
        <span className="d-fl">
            {renderDateTime(selectedTime, "Viewing")}
            {renderDateTime(updatedTime, "Updated")}
        </span>
        <div style={{ margin: "20px 0px 0px 0px", height: 90, width: "90%" }}>
          <Slider mode={1}
                  step={halfHour}
                  domain={[+tsToDate(min), +tsToDate(max)]}
                  rootStyle={sliderStyle}
                  onUpdate={onUpdate}
                  values={[+tsToDate(selectedTime)]}>
            <Rail>
              {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
            </Rail>
            <Handles>
              {({ handles, getHandleProps }) => (
                <div>
                  {handles.map(handle => (
                    <Handle key={handle.id}
                            handle={handle}
                            domain={[+ tsToDate(min), +tsToDate(max)]}
                            getHandleProps={getHandleProps}/>))}
                </div>
              )}
            </Handles>
            <Tracks right={false}>
              {({ tracks, getTrackProps }) => (
                <div>
                  {tracks.map(({ id, source, target }) => (
                    <Track key={id}
                           source={source}
                           target={target}
                           getTrackProps={getTrackProps}/>))}
                </div>
              )}
            </Tracks>
            <Ticks values={dateTicks}>
              {({ ticks }) => (
                <div>
                  {ticks.map(tick => (
                    <Tick key={tick.id}
                          tick={tick}
                          count={ticks.length}
                          format={formatTick}/>
                  ))}
                </div>
              )}
            </Ticks>
          </Slider>
        </div>        
      </div>
    );
}