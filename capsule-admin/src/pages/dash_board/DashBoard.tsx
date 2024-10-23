import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { StyledEngineProvider } from '@mui/material/styles';
import { Checkbox } from '@mui/material';
import { produce } from 'immer';
import { commonStateStore } from '../../store/commonStore';

export default function DataGridDemo() {
  const { setCurrentMenuKey } = commonStateStore();
  React.useEffect(() => {
    setCurrentMenuKey(1);
  },[]);
  
    const [rows, setRows] = React.useState([
        { id: 1, lastName: 'Snow', firstName: 'Jon', age: 14, checked: false },
        { id: 2, lastName: 'Lannister', firstName: 'Cersei', age: 31, checked: true },
        { id: 3, lastName: 'Lannister', firstName: 'Jaime', age: 31, checked: true },
        { id: 4, lastName: 'Stark', firstName: 'Arya', age: 11, checked: false },
        { id: 5, lastName: 'Targaryen', firstName: 'Daenerys', age: null, checked: false },
        { id: 6, lastName: 'Melisandre', firstName: null, age: 150, checked: false },
        { id: 7, lastName: 'Clifford', firstName: 'Ferrara', age: 44, checked: false },
        { id: 8, lastName: 'Frances', firstName: 'Rossini', age: 36, checked: false },
        { id: 9, lastName: 'Roxie', firstName: 'Harvey', age: 65, checked: false },
    ]);
    
    const columns: GridColDef<(typeof rows)[number]>[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
          field: 'checked',
          headerName: 'First name',
          width: 150,
          editable: false,
          renderCell: (param) => {
            
            return (
                <Checkbox checked={param.row.checked}
                    onClick={() => {
                        const newRows = produce(rows, (draft => {
                            const row = draft.find(item => item.id == param.row.id);
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
          field: 'lastName',
          headerName: 'Last name',
          width: 150,
          editable: true,
        },
        {
          field: 'age',
          headerName: 'Age',
          type: 'number',
          width: 110,
          editable: true,
        },
        {
          field: 'fullName',
          headerName: 'Full name',
          description: 'This column has a value getter and is not sortable.',
          sortable: false,
          width: 160,
          valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
        },
      ];

  return (
    <>
        <StyledEngineProvider injectFirst>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: {
                        pageSize: 5,
                        },
                    },
                    }}
                    pageSizeOptions={[5]}
                    // checkboxSelection
                    disableRowSelectionOnClick
                />
            </Box>
        </StyledEngineProvider>
    </>
  );
}