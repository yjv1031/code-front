import { ChangeEvent, useEffect, useState } from "react";
import AlertLayout from "../../component/layout/AlertLayout";
import { ImageMemberType, ProductSaveAlertPropsType, ProductSaveApiParameterType, ProductSaveImageParamType, ProductSaveStateType } from "../../module/interfaceModule";
import { commonStateStore } from "../../store/commonStore";
import { Tooltip } from "@mui/material";
import ProductSaveAlertImageGrid from "./ProductSaveAlertImageGrid";

function ProductSaveAlert(props: ProductSaveAlertPropsType) {
    const { commonAjaxWrapper } = commonStateStore();
    const setAlertFlag = props.setAlertFlag;
    const trySearchList = props.trySearchList;
    const masterSeq = props.masterSeq;
    const [productSaveState, setProductSaveState] = useState<ProductSaveStateType>({
        seq: null,
        name: '',
        amount: 10000,
        gradeNum: 0,
        imageSeq: null,
        imageList: [],
        imageMstName: ''
    });
    const [productSaveImageParam, setProductSaveImageParam] = useState<ProductSaveImageParamType>({
        imageSeq: null,
        imageList: [],
        imageMstName: '',
    });
    

    useEffect(() => {
        getInitData();
    }, []);

    const handleSetProductSaveParam = (paramName: string, value: any) => {
        if(paramName == 'name') {
            setProductSaveState((prev) => ({...prev, name: value}));
        } else if (paramName == 'amount') {
            if(!value) {
                setProductSaveState((prev) => ({...prev, amount: 0}));
            }
            if (/^\d+$/.test(value)) { // 정규식을 사용하여 숫자만 있는지 확인
                const intValue = parseInt(value); // 입력값을 정수로 변환
                if (intValue >= 0) { // 양의 정수인지 확인
                    setProductSaveState((prev) => ({...prev, amount: Number(value)}));
                }
            }
        } else if (paramName == 'gradeNum') {
            setProductSaveState((prev) => ({...prev, gradeNum: Number(value)}));
        } else if (paramName == 'imageSeq') {
            setProductSaveState((prev) => ({...prev, imageSeq: Number(value)}));
        } else if (paramName == 'imageList') {
            setProductSaveState((prev) => ({...prev, imageList: value}));
        } else if (paramName == 'imageMstName') {
            setProductSaveState((prev) => ({...prev, imageMstName: value}));
        }
    }

    const getInitData = async() => {
        if(masterSeq != -1) {
            const res = await commonAjaxWrapper('get', `/product/${masterSeq}`, {});
            if(res) {
                setProductSaveState({
                    seq: res.seq,
                    name: res.name,
                    gradeNum: res.gradeNum,
                    amount: res.amount,
                    imageSeq: res.imgInfo ? res.imgInfo.seq : null,
                    imageMstName: res.imgInfo ? res.imgInfo.name : '',
                    imageList: res.imageList
                });
            } else {
                alert('잘못된 상품 그룹입니다');
                setAlertFlag(false);
            }
        }
    }

    const changeImage = () => {
        if(!productSaveImageParam.imageSeq) {
            alert('이미지를 선택하고 변경하여 주십시오');
            return;
        }
        handleSetProductSaveParam('imageSeq', productSaveImageParam.imageSeq);
        handleSetProductSaveParam('imageList', productSaveImageParam.imageList);
        handleSetProductSaveParam('imageMstName', productSaveImageParam.imageMstName);
    }

    const saveProduct = async() => {
        const param: ProductSaveApiParameterType = {
            seq: masterSeq,
            name: productSaveState.name,
            amount: productSaveState.amount,
            gradeNum: productSaveState.gradeNum,
            imageSeq: productSaveState.imageSeq
        };

        if(!param.name || param.name.trim() == '') {
            alert('상품명을 입력하여 주십시오');
            return;
        }

        if(!param.amount) {
            alert('상품 재고를 입력하여 주십시오');
            return;
        }

        if(!param.gradeNum || param.gradeNum == 0) {
            alert('상품 등급을 선택하여 주십시오');
            return;
        }

        let method = '';
        if(param.seq == -1) {
            method = 'post';
        } else {
            method = 'put';
        }

        const res = await commonAjaxWrapper(method, '/product', param);
        if(res) {
            alert('저장에 성공 하였습니다');
            setAlertFlag(false);
            trySearchList();
        }
    }

    return (
        <AlertLayout>
            <div className="popup_wrap">
                <div className="popup_header">상품 {masterSeq == -1 ? '등록' : '수정'}</div>
                <div className="popup_contents">
                    <div className="srch_wrap">
                        <ul>
                            <li>
                                <label>상품 명</label>
                                <input className="inp-text" type="text" maxLength={50} placeholder="상품 명 입력"
                                value={productSaveState.name} onChange={(e : ChangeEvent<HTMLInputElement>) => handleSetProductSaveParam('name', e.target.value)}/>
                            </li>
                            <li>
                                <label>재고</label>
                                <input className="inp-text" type="text" maxLength={9} placeholder="상품 명 입력"
                                value={productSaveState.amount} onChange={(e : ChangeEvent<HTMLInputElement>) => handleSetProductSaveParam('amount', e.target.value)}/>
                            </li>
                            <li>
                                <label>등급</label>
                                <div className="type-selectbox" style={{width: '50%'}}>
                                    <select className="inp-selectbox" value={productSaveState.gradeNum} onChange={(e : ChangeEvent<HTMLSelectElement>) => { handleSetProductSaveParam('gradeNum', e.target.value); }}>
                                        <option value='0'>선택안함</option>
                                        <option value='1'>1등급</option>
                                        <option value='2'>2등급</option>
                                        <option value='3'>3등급</option>
                                    </select>
                                </div>
                            </li>
                            <li>
                                <label>이미지</label>
                                <Tooltip title={
                                    <div>
                                        {
                                            productSaveState.imageList.map(item => (
                                                <img key={item.seq} src={item.imgUrl} alt="Preview" width="100" />
                                            ))
                                        }
                                    </div>
                                } arrow placement="right">
                                    <button className="btn-srch btn-input">{productSaveState.imageMstName ? productSaveState.imageMstName : '이미지없음'}</button>
                                </Tooltip>
                            </li>
                        </ul>
                        <div className="btnArea">
                        <button className="btn-srch" onClick={() => {changeImage();}}>이미지 임시</button>
                            <button className="btn-srch" onClick={() => {saveProduct();}}>상품 저장</button>
                        </div>
                    </div>
                    {/* <div className="grid_btn_right_wrap">
                        <a className="btn-blue">추가</a>
                        <a className="btn-blue">삭제</a>
                        <a className="btn-blue">조회</a>
                        <a className="btn-blue">Button</a>
                    </div> */}
                    <div className="popup_grid_area">
                        <ProductSaveAlertImageGrid setProductSaveImageParam={setProductSaveImageParam}>
                        </ProductSaveAlertImageGrid>
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

export default ProductSaveAlert;
