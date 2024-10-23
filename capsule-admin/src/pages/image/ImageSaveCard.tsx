import { ChangeEvent, useEffect } from "react";
import { Card, CardContent, CardMedia, IconButton, Input, InputLabel, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ImageCardPropsType } from "../../module/interfaceModule";

function ImageSaveCard(props: ImageCardPropsType) {

  useEffect(() => {
  }, []);

  const seq = props.seq;
  const sortOrder = props.sortOrder;
  const imgUrl = props.imgUrl;
  const onDelete = props.onDelete;
  const handleImageCardSortOrderChange = props.handleImageCardSortOrderChange;

  const handleSortOrderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if(inputValue === '') {
        handleImageCardSortOrderChange(seq, null); // null 값을 전달하여 순서를 제거
    } else if (/^\d+$/.test(inputValue)) { // 정규식을 사용하여 숫자만 있는지 확인
        const intValue = parseInt(inputValue); // 입력값을 정수로 변환
        if (intValue >= 0) { // 양의 정수인지 확인
            handleImageCardSortOrderChange(seq, intValue); // 양의 정수라면 변경된 값을 사용
        }
    }
  }

  return (
    <Card sx={{ width: 300, margin: 1}}>
        <CardMedia component="img" image={imgUrl} alt="미리보기 이미지" />
        <CardContent>
            <InputLabel>순서</InputLabel>
            <Input type="text" sx={{width: 150}}
                inputProps={{ maxLength: 5 }}
                value={sortOrder == null ? '' : `${sortOrder}`} 
                onChange={handleSortOrderChange}/>
            <IconButton onClick={() => { onDelete(seq); }}>
                <DeleteIcon />
            </IconButton>
        </CardContent>
    </Card>
  );
}

export default ImageSaveCard;
