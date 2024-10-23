import { ChangeEvent, useEffect, useState } from "react";
import { commonStateStore } from "../../store/commonStore";
import { ProductInfoType } from "../../module/interfaceModule";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Checkbox, Tooltip } from "@mui/material";
import { produce } from "immer";
import ProductSaveAlert from "./ProductSaveAlert";


function ProductMain() {
    const { setCurrentMenuKey, commonAjaxWrapper } = commonStateStore();
    const [rows, setRows] = useState<ProductInfoType[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [paramObject, setParamObject] = useState({
        gradeNum: '',
        name: ''
    });
    const [paginationModel, setPaginationModel] = useState({
      page: 0,
      pageSize: 10,
    });

    const changeParamObject = (paramName: string, value: any) => {
        if(paramName === 'gradeNum') {
            setParamObject((prev) => ({...prev, gradeNum: value}));
        } else if(paramName === 'name'){
            setParamObject((prev) => ({...prev, name: value}));
        }
    }

    const resetCondition = () => {
        setParamObject({
            gradeNum: '',
            name: ''
        });
    }

    const trySearchList = async(page: number) => {
        const data = await commonAjaxWrapper('get', `/product?gradeNum=${paramObject.gradeNum}&name=${paramObject.name}&page=${page + 1}&size=${paginationModel.pageSize}`, {});
        if(data) {
            const convertRows = data.content.map((item: ProductInfoType) => {
                return {
                    ...item,
                    checked: false
                }
            });
            setRows(convertRows);
            setTotalRows(data.totalElements);
        }
    }

    const tryUseYnList = async(useYn: string) => {
        if(useYn != 'Y' && useYn != 'N') {
            return;
        }

        const useYnList = rows.filter((item) => {
            return item.checked == true;
        }).map((item) => {
            return {
                seq: item.seq
            }
        });
    
        const param = {
            useYn: useYn,
            useYnList : useYnList
        };
    
        if(param.useYnList.length == 0) {
            alert(`${useYn == 'Y' ? '활성화할' : '비활성화할'} 그룹을 체크하여 주십시오`);
            return;
        }
    
        const data = await commonAjaxWrapper('put', `/product/useYn`, param);
        if(data) {
            alert(`${useYn == 'Y' ? '활성화' : '비활성화'} 하였습니다`);
        }
        trySearchList(paginationModel.page);
    }

    const handlePageChange = (model: GridPaginationModel) => {
        setPaginationModel((prev) => ({...prev, page: model.page}));
        trySearchList(model.page);
    }

    useEffect(() => {
        setCurrentMenuKey(3);
        trySearchList(paginationModel.page);
    },[]);

    const [alertFlag, setAlertFlag] = useState<boolean>(false);
    const [masterSeq, setMasterSeq] = useState<number>(-1);

    const columns: GridColDef<ProductInfoType>[] = [
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
            headerName: '상품 명',
            width: 200,
            editable: false,
            sortable: false,
            filterable: false,
        },
        {
            field: 'useYn',
            headerName: '활성화 여부',
            width: 100,
            editable: false,
            sortable: false,
            filterable: false,
        },
        {
            field: 'gradeNum',
            headerName: '등급',
            description: '',
            sortable: false,
            filterable: false,
            width: 100
        },
        {
            field: 'amount',
            headerName: '재고',
            description: '',
            sortable: false,
            filterable: false,
            width: 100
        },
        {
            field: 'productUpdate',
            headerName: '상품 수정',
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
            field: 'imgGroup',
            headerName: '이미지 그룹 명',
            description: '',
            sortable: false,
            filterable: false,
            width: 100,
            renderCell: (param) => {
                return (
                    <p>{param.row.imgInfo ? param.row.imgInfo.name : ''}</p>
                );
            }
        },
        {
            field: 'imageView',
            headerName: '상품 이미지 미리보기',
            width: 150,
            editable: false,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                return (
                    <>
                        {
                            params.row.imgInfo ? 
                                <Tooltip title={
                                    <div>
                                        {
                                            params.row.imageList.map(item => (
                                                <img key={`${params.row.seq}_${item.seq}`} src={item.imgUrl} alt="Preview" width="100" />
                                            ))
                                        }
                                    </div>
                                } arrow placement="right">
                                    <button className="grid_image_thumnail_button">이미지 미리보기</button>
                                </Tooltip> : 
                                <></>
                        }
                    </>
                );
            }
        },
    ];

    return (
        <>
            <h2 className="subtitle">상품 관리</h2>
            <div className="srch_wrap">
                <ul>
                    <li>
                        <label>상품 명</label>
                        <input className="inp-text" type="text" placeholder="" maxLength={20}
                        value={paramObject.name} onChange={(e : ChangeEvent<HTMLInputElement>) => { changeParamObject('name', e.target.value); }}/>
                    </li>
                    <li>
                        <label>등급 검색</label>
                        <div className="type-selectbox" style={{width: '50%'}}>
                            <select className="inp-selectbox" value={paramObject.gradeNum} onChange={(e : ChangeEvent<HTMLSelectElement>) => { changeParamObject('gradeNum', e.target.value); }}>
                                <option value=''>선택안함</option>
                                <option value='1'>1등급</option>
                                <option value='2'>2등급</option>
                                <option value='3'>3등급</option>
                            </select>
                        </div>
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
                        <a className="btn-blue" onClick={() => {tryUseYnList('Y');}}>활성화</a>
                        <a className="btn-blue" onClick={() => {tryUseYnList('N');}}>비활성화</a>
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
                alertFlag ? (<ProductSaveAlert masterSeq={masterSeq} setAlertFlag={setAlertFlag} trySearchList={()=>{trySearchList(paginationModel.page);}}></ProductSaveAlert>) : ''
            }
        </>
    );
}

export default ProductMain;
