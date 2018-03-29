
export const baseModalStyle = {
    overlay : {
        backgroundColor   : "rgba(0, 0, 0, 0.66)"
    }
};

export const dialogModalStyle = {
    ...baseModalStyle,
    content : {
        top                   : "20%",
        left                  : "50%",
        right                 : "auto",
        bottom                : "auto",
        marginRight           : "-50%",
        transform             : "translate(-50%, -20%)"
    }
};

export const leftSideModalStyle = {
    ...baseModalStyle,
    content : {
        top                   : "60px",
        left                  : "100px",
        right                 : "auto",
        bottom                : "auto",
        backgroundColor       : "transparent",
        border                : "0",
        zIndex                : "2"
    }
};

export const rightSideModalStyle = {
    overlay : {
        backgroundColor   : "rgba(0, 0, 0, 0)",
        pointerEvents     : "none"
    },
    content : {
        top                   : "60px",
        right                 : "auto",
        left                  : "calc(140px + 38vw)",
        bottom                : "auto",
        pointerEvents         : "auto"
    }
};


export const dialogContainerStyle = {
  minWidth      : "300px",
  minHeight     : "300px"
};