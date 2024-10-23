import { ChangeEvent, createRef, useEffect, useRef, useState } from "react";
import { commonStateStore } from "../../store/commonStore";
import { Input, Tooltip } from "@mui/material";
import { produce } from "immer";
import AlertLayout from "../../component/layout/AlertLayout";
import { ImageCardParameterType, ImageCardSaveParameterType, ImageNewMemberType, ImageSaveAlertPropsType } from "../../module/interfaceModule";
import ImageSaveCard from "./ImageSaveCard";
import axios from "axios";


function ImageSaveAlert(props: ImageSaveAlertPropsType) {
  const { commonAjaxWrapper, setIsLoading } = commonStateStore();
  const setAlertFlag = props.setAlertFlag;
  const trySearchList = props.trySearchList;
  const masterSeq = props.masterSeq;
  const [newSelectedFiles, setNewSelectedFiles] = useState<ImageNewMemberType[]>([]);
  const [currentSelectedFiles, setCurrentSelectedFiles] = useState<ImageNewMemberType[]>([]);
  const [imageMasterName, setImageMasterName] = useState<string>('');

  useEffect(() => {
    getInitData();
  }, []);

  const getInitData = async() => {
    if(masterSeq != -1) {
        const res = await commonAjaxWrapper('get', `/image/${masterSeq}`, {});
        if(res) {
            setImageMasterName(res.name);
            setCurrentSelectedFiles(res.memberList.map((item: ImageNewMemberType) => {
                return {
                    seq: item.seq,
                    sortOrder: item.sortOrder,
                    imgUrl: item.imgUrl
                }
            }));
        } else {
            alert('잘못된 이미지 그룹입니다');
            setAlertFlag(false);
        }
    }
  }

  const handleImageMasterName = (e: ChangeEvent<HTMLInputElement>) => {
    setImageMasterName(e.target.value);
  }

  const saveGroupData = async() => {
    const createCard: ImageCardParameterType[] = newSelectedFiles.map((item: ImageNewMemberType) => {
        return {
            seq: item.seq,
            sortOrder: item.sortOrder
        };
    });

    const updateCard: ImageCardParameterType[] = currentSelectedFiles.map((item: ImageNewMemberType) => {
        return {
            seq: item.seq,
            sortOrder: item.sortOrder
        };
    });

    const param: ImageCardSaveParameterType = {
        createCard: createCard,
        updateCard: updateCard,
        name: imageMasterName,
        seq: masterSeq
    };

    if(!imageMasterName) {
        alert('그룹명을 입력하십시오');
        return;
    }

    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(param)], { type: 'application/json' });
    formData.append('requestDTO', jsonBlob);

    newSelectedFiles.forEach((item: ImageNewMemberType) => {
        // 파일 객체와 함께 파일 이름과 MIME 타입을 함께 전달
        formData.append('files', item.file);
    });

    setIsLoading(true);
    let method = '';
    if(masterSeq == -1) {
        method = 'post';
    } else {
        method = 'put';
    }
    const res = await commonAjaxWrapper(method, '/image', formData);
    if(res) {
        alert('저장에 성공 하였습니다');
        setAlertFlag(false);
        trySearchList();
    }
  }

  const countRef = useRef<number>(0);

  //이미지 추가 버튼 클릭
  const handleButtonClick = () => {
    // 파일 입력(input type="file") 클릭
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert('파일 크기는 3MB 이하여야 합니다.');
      } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('이미지 파일은 JPG 또는 PNG 형식이어야 합니다.');
      } else {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = (event) => {
            const width = img.width;
            const height = img.height;
            if(width != 800 || height != 450) {
                alert('가로 800 세로 450인 이미지를 사용하여 주십시오');
                return;
            }

            countRef.current += 1;
            const newFile: ImageNewMemberType = {
                sortOrder: null,
                seq: countRef.current,
                file: file,
                imgUrl: url
            }
            setNewSelectedFiles((prev) => ([...prev, newFile]));
        };
      }
    }
  };

  const handleImageCardSortOrderChange = (seq: number, sortOrder: number | null) => {
    const newDraft = produce(newSelectedFiles, (draft) => {
        const targetIndex = draft.findIndex(item => item.seq === seq);
        if (targetIndex !== -1) {
            draft[targetIndex].sortOrder = sortOrder;
        }
    });

    setNewSelectedFiles(newDraft);
  }

  const handleImageCardSortOrderUpdateChange = (seq: number, sortOrder: number | null) => {
    const newDraft = produce(currentSelectedFiles, (draft) => {
        const targetIndex = draft.findIndex(item => item.seq === seq);
        if (targetIndex !== -1) {
            draft[targetIndex].sortOrder = sortOrder;
        }
    });

    setCurrentSelectedFiles(newDraft);
  }

  const imageCardDelete = (seq: number) => {
    setNewSelectedFiles(newSelectedFiles.filter((item) => {return item.seq != seq}));
  }

  const imageCardUpdateDelete = (seq: number) => {
    setCurrentSelectedFiles(currentSelectedFiles.filter((item) => {return item.seq != seq}));
  }

  const fileInputRef = createRef<HTMLInputElement>();

  return (
    <AlertLayout>
        <div className="popup_wrap">
            <div className="popup_header">이미지 그룹 {masterSeq == -1 ? '등록' : '수정'}</div>
            <div className="popup_contents">
                <div className="srch_wrap">
                    <ul>
                        <li>
                            <label>이미지 그룹 명</label>
                            <input className="inp-text" type="text" maxLength={50} placeholder="기본입력필드" value={imageMasterName} onChange={handleImageMasterName}/>
                        </li>
                        <li>
                            <label>이미지 추가</label>
                            <button className="btn-srch btn-input" onClick={handleButtonClick}>이미지 추가</button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}}/>
                        </li>
                        
                        
                    </ul>
                    <div className="btnArea">
                        <button className="btn-srch" onClick={saveGroupData}>그룹 저장</button>
                    </div>
                </div>
                {/* <div className="grid_btn_right_wrap">
                    <a className="btn-blue">추가</a>
                    <a className="btn-blue">삭제</a>
                    <a className="btn-blue">조회</a>
                    <a className="btn-blue">Button</a>
                </div> */}
                <div className="popup_grid_area">
                    <div style={{ display: 'flex', overflowX: 'auto' }}>
                        {currentSelectedFiles.map(item => {
                            return (
                                <ImageSaveCard key={item.seq} seq={item.seq} sortOrder={item.sortOrder} imgUrl={item.imgUrl} 
                                handleImageCardSortOrderChange = {handleImageCardSortOrderUpdateChange}
                                onDelete={imageCardUpdateDelete}>
                                </ImageSaveCard>
                            );
                        })}
                        {newSelectedFiles.map(item => {
                            return (
                                <ImageSaveCard key={item.seq} seq={item.seq} sortOrder={item.sortOrder} imgUrl={item.imgUrl} 
                                handleImageCardSortOrderChange = {handleImageCardSortOrderChange}
                                onDelete={imageCardDelete}>
                                </ImageSaveCard>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="popup_footer">
                <div className="btn_wrap">
                    {/* <a className="btn-blue">Save</a> */}
                    <a className="btn-gray" onClick={() => { setAlertFlag(false); }}>Close</a>
                </div>
            </div>
        </div>
    </AlertLayout>
  );
}

export default ImageSaveAlert;
