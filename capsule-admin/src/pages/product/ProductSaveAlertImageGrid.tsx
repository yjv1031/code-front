import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { ChangeEvent, useEffect, useState } from "react";
import { commonStateStore } from "../../store/commonStore";
import { Checkbox, Tooltip } from "@mui/material";
import { produce } from "immer";
import { ProductSaveImageGridParamType, ProductSaveImageParamType } from "../../module/interfaceModule";


function ProductSaveAlertImageGrid(props: ProductSaveImageGridParamType) {
    const setProductSaveImageParam = props.setProductSaveImageParam;

    const { commonAjaxWrapper } = commonStateStore();

    const [searchKeyword, setSearchKeyword] = useState<string>('');
    const [rows, setRows] = useState<any[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [paginationModel, setPaginationModel] = useState({
      page: 0,
      pageSize: 10,
    });
  
    const searchKeywordChangehandler = (e: ChangeEvent<HTMLInputElement>) => {
      setSearchKeyword(e.target.value);
    }
  
    const trySearchList = async(page: number) => {
      const param = {};
      const data = await commonAjaxWrapper('get', `/image?page=${page + 1}&size=${paginationModel.pageSize}`, param);
      if(data) {
          const convertRows = data.content.map((item: any) => {
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
        trySearchList(paginationModel.page);
    },[]);
    
    const columns: GridColDef<any>[] = [
        {
            field: 'checked',
            headerName: '선택',
            width: 70,
            editable: false,
            renderCell: (param) => {
                return (
                    <Checkbox checked={param.row.checked}
                        onClick={() => {
                            let newRows: any[] = [];
                            const targetRow = rows.find(item => item.seq == param.row.seq);
                            if(targetRow) {
                                if(targetRow.checked) {
                                    newRows = rows.map((item) => {
                                        return {
                                            ...item,
                                            checked: false
                                        };
                                    });
                                    const paramRow: ProductSaveImageParamType = {
                                        imageList: [],
                                        imageMstName: '',
                                        imageSeq: null
                                    }
                                    setProductSaveImageParam(paramRow);
                                } else {
                                    newRows = rows.map((item) => {
                                        return {
                                            ...item,
                                            checked: item.seq == param.row.seq
                                        };
                                    });
                                    const paramRow: ProductSaveImageParamType = {
                                        imageList: param.row.memberList,
                                        imageMstName: param.row.name,
                                        imageSeq: param.row.seq
                                    }
                                    setProductSaveImageParam(paramRow);
                                }
                            }
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
        {
            field: 'useYn',
            headerName: '활성화 여부',
            width: 100,
            editable: false,
            sortable: false,
            filterable: false,
        },
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
                                params.row.memberList.map((item: any) => (
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
          <div className="srch_wrap">
              <ul>
                  <li>
                      <label>이미지 그룹 명</label>
                      <input className="inp-text" type="text" placeholder="기본입력필드" maxLength={20}
                      value={searchKeyword} onChange={searchKeywordChangehandler}/>
                  </li>
              </ul>
              <div className="btnArea">
                  <button className="btn-reset">Reset</button>
                  <button className="btn-srch" onClick={() => {trySearchList(0);}}>Search</button>
              </div>
          </div>
          <div className="tabArea">
              <div className="tab-content" id="tabC01">
                  <div className="grid_area" style={{height: '400px'}}>
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
      </>
    );
}

export default ProductSaveAlertImageGrid;
