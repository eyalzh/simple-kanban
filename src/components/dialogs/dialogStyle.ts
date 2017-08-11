
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

export const dialogContainerStyle = {
  minWidth      : "300px",
  minHeight     : "300px"
};