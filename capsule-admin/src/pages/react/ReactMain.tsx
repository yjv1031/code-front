import { useEffect } from "react";
import { commonStateStore } from "../../store/commonStore";

function ReactMain() {
    const { setCurrentMenuKey, commonAjaxWrapper } = commonStateStore();

    useEffect(() => {
        setCurrentMenuKey(4);
    },[]);

    return (
        <>
        </>
    );
}

export default ReactMain;
