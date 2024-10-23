import { ChangeEvent, useEffect, useState } from "react";
import { commonStateStore } from "../../store/commonStore";
import { DataGrid, GridColDef, GridEventListener, GridPaginationModel } from "@mui/x-data-grid";
import { Tooltip } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { produce } from "immer";
import ImageSaveAlert from "./ImageSaveAlert";
import { ImageMasterType } from "../../module/interfaceModule";
import { OtherHouses } from "@mui/icons-material";

function ImageList() {
  const { setCurrentMenuKey, commonAjaxWrapper } = commonStateStore();
  const [paramObject, setParamObject] = useState({
    name: ''
  });
  const [rows, setRows] = useState<ImageMasterType[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const changeParamObject = (paramName: string, value: any) => {
    if(paramName === 'name'){
        setParamObject((prev) => ({...prev, name: value}));
    }
  }

  const resetCondition = () => {
    setParamObject({
        name: ''
    });
  }

  const trySearchList = async(page: number) => {
    const param = {};
    const data = await commonAjaxWrapper('get', `/image?name=${paramObject.name}&page=${page + 1}&size=${paginationModel.pageSize}`, param);
    if(data) {
        const convertRows = data.content.map((item: ImageMasterType) => {
            return {
                ...item,
                checked: false
            }
        });
        setRows(convertRows);
        setTotalRows(data.totalElements);
    }
  }

  const handlePageChange = (model: GridPaginationModel) => {
    setPaginationModel((prev) => ({...prev, page: model.page}));
    trySearchList(model.page);
  }

  const tryDeleteList = async() => {
    const deleteList = rows.filter((item) => {
        return item.checked == true;
    }).map((item) => {
        return {
            seq: item.seq
        }
    });

    const param = {
        deleteList : deleteList
    };

    if(param.deleteList.length == 0) {
        alert('삭제할 그룹을 체크하여 주십시오');
        return;
    }

    const data = await commonAjaxWrapper('delete', `/image`, param);
    if(data) {
        alert('이미지 그룹을 삭제하였습니다');
    }
    trySearchList(paginationModel.page);
  }

  useEffect(() => {
      setCurrentMenuKey(2);
      trySearchList(paginationModel.page);
  },[]);
  
  const columns: GridColDef<ImageMasterType>[] = [
    {
        field: 'checked',
        headerName: '선택',
        width: 70,
        editable: false,
        renderCell: (param) => {
            
            return (
                <Checkbox checked={param.row.checked}
                    onClick={() => {
                        const newRows = produce(rows, (draft => {
                            const row = draft.find(item => item.seq == param.row.seq);
                            if(row) {
                                row.checked = !row.checked;
                            }
                        }));
                        setRows(newRows);
                    }}
                />
            );
        }
    },
    {
        field: 'seq',
        headerName: '그룹 아이디',
        width: 100,
        editable: false,
        sortable: false,
        filterable: false,
    },
    {
        field: 'name',
        headerName: '그룹 명',
        width: 200,
        editable: false,
        sortable: false,
        filterable: false,
    },
    // {
    //     field: 'useYn',
    //     headerName: '활성화 여부',
    //     width: 100,
    //     editable: false,
    //     sortable: false,
    //     filterable: false,
    // },
    {
        field: 'fullName',
        headerName: '이미지 개수',
        description: '',
        sortable: false,
        filterable: false,
        width: 100,
        valueGetter: (value, row) => `${row.memberList.length}`,
    },
    {
        field: 'imageUpdate',
        headerName: '이미지 그룹 수정',
        width: 150,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (param) => {
            return (
                <button className="grid_image_update_button" onClick={() => {setMasterSeq(param.row.seq); setAlertFlag(true);}}>수정시 클릭</button>
            );
        }
    },
    {
        field: 'imageView',
        headerName: '이미지 미리보기',
        width: 150,
        editable: false,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            return (
                <Tooltip title={
                    <div>
                        {
                            params.row.memberList.map(item => (
                                <img key={item.seq} src={item.imgUrl} alt="Preview" width="100" />
                            ))
                        }
                    </div>
                } arrow placement="right">
                    <button className="grid_image_thumnail_button">이미지 미리보기</button>
                </Tooltip>
            );
        }
    },
  ];

  const [alertFlag, setAlertFlag] = useState<boolean>(false);
  const [masterSeq, setMasterSeq] = useState<number>(-1);

  return (
    <>
        <h2 className="subtitle">이미지 관리</h2>
        <div className="srch_wrap">
            <ul>
                <li>
                    <label>이미지 그룹 명</label>
                    <input className="inp-text" type="text" placeholder="" maxLength={20}
                        value={paramObject.name} onChange={(e : ChangeEvent<HTMLInputElement>) => { changeParamObject('name', e.target.value); }}/>
                </li>
            </ul>
            <div className="btnArea">
                <button className="btn-reset" onClick={resetCondition}>Reset</button>
                <button className="btn-srch" onClick={() => {trySearchList(0);}}>Search</button>
            </div>
        </div>
        <div className="tabArea">
            <div className="tab-content" id="tabC01">
                <div className="grid_btn_right_wrap">
                    <a className="btn-blue" onClick={() => {setMasterSeq(-1); setAlertFlag(true);}}>추가하기</a>
                    <a className="btn-blue" onClick={() => {tryDeleteList();}}>삭제하기</a>
                </div>
                <div className="grid_area" style={{height: '600px'}}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row)=>(row.seq)}
                        rowCount={totalRows}
                        pageSizeOptions={[paginationModel.pageSize]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePageChange}
                        paginationMode="server"
                        getRowClassName={(params) => {return params.row.checked ? 'grid_checked_row': ''}}
                    />
                </div>
            </div>
        </div>
        {
            alertFlag ? (<ImageSaveAlert setAlertFlag={setAlertFlag} masterSeq={masterSeq} trySearchList={()=>{trySearchList(paginationModel.page);}}></ImageSaveAlert>) : ''
        }
    </>
  );
}

export default ImageList;
