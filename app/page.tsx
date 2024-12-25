"use client";

import ExpenseItem, { Expense } from '@/components/ExpenseItem';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Menu, MenuItem, Modal, Snackbar, TextField } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MouseEvent, useState } from 'react';

interface ExpenseData {
  id: number;
  name: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

interface SnackbarNotification {
  message: string;
  severity: 'success' | 'error';
  open: boolean;
}

export default function Home() {
  const [isOpenAddNew, setIsOpenAddNew] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [newName, setNewName] = useState<string>('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [isShowAddNewError, setIsShowAddNewError] = useState(false);
  const [isShowEditError, setIsShowEditError] = useState(false);
  const [isShowSnackbar, setIsShowSnackbar] = useState<SnackbarNotification>({message: '', severity: 'success', open: false});
  const [expenseMenuAnchorEl, setExpenseMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedData, setSelectedData] = useState<Expense | null>(null);
  const [isShowDeleteDialog, setIsShowDeleteDialog] = useState(false);
  const isOpenExpenseMenu = Boolean(expenseMenuAnchorEl);

  const queryClient = useQueryClient();

  const expenseList = useQuery({ queryKey: ['expensesData'], queryFn: () => fetch('http://localhost:3001/expense').then(res => res.json()) });

  const expenseTotal = useQuery({ queryKey: ['expenseTotal'], queryFn: () => fetch('http://localhost:3001/expense/total').then(res => res.json()) });

  const newExpenseMutation = useMutation({
    mutationFn: async (newData: { name: string, amount: number }) => {
      const response = await fetch('http://localhost:3001/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })
      
      if (!response.ok) {
        console.log('Response not ok');
        setIsShowSnackbar({message:"Failed to add new expense", severity:'error' , open:true});
        return;
      }

      setIsShowSnackbar({message:"Successfully added new expense", severity:'success' , open:true});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expensesData'] });
      queryClient.invalidateQueries({ queryKey: ['expenseTotal'] });
    },
  })

  const updateExpenseMutation = useMutation({
    mutationFn: async (newData: { id:number, name: string, amount: number }) => {
      const response = await fetch(`http://localhost:3001/expense/${newData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      })
      
      if (!response.ok) {
        console.log('Response not ok');
        setIsShowSnackbar({message:"Failed to update expense", severity:'error' , open:true});
        return;
      }

      setIsShowSnackbar({message:"Successfully updated expense", severity:'success' , open:true});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expensesData'] });
      queryClient.invalidateQueries({ queryKey: ['expenseTotal'] });
    },
  })

  const deleteExpenseMutatation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`http://localhost:3001/expense/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        console.log('Response not ok');
        setIsShowSnackbar({message:"Failed to delete expense", severity:'error' , open:true});
        return;
      }

      setIsShowSnackbar({message:"Successfully deleted expense", severity:'success' , open:true});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expensesData'] });
      queryClient.invalidateQueries({ queryKey: ['expenseTotal'] });
    }
  })  

  const handleNewExpenseSubmit = () => {
       if (newName === '' || newAmount === 0) {
        setIsShowAddNewError(true);
        return;
       }
       
       newExpenseMutation.mutate({
        name: newName,
        amount: newAmount
       })

       setIsOpenAddNew(false);
       setIsShowAddNewError(false);
       setNewName('');
       setNewAmount(0);
  }

  const handleEditExpenseSubmit = () => {
    if (newName === '' && newAmount === 0) {
      setIsShowEditError(true);
      return;
     }
     
     if (selectedData) {
      updateExpenseMutation.mutate({
        id: selectedData.id,
        name: newName,
        amount: newAmount
      })  
     } else {
      console.log("Unable to retrieve selected data.")
     }     

     setIsOpenEditModal(false);
     setIsShowEditError(false);
     setExpenseMenuAnchorEl(null)
     setNewName('');
     setNewAmount(0);
  }

  const handleAddNewClose = () => {
    setIsOpenAddNew(false);
    setIsShowAddNewError(false);
  }

  const handleEditModalClose = () => {
    setIsOpenEditModal(false);
    setIsShowEditError(false);
  }

  const handleSnackbarClose = () => {
    setIsShowSnackbar({message: '', severity: 'success', open: false});
  }

  const handleExpenseItemMenuClick = (event: MouseEvent<HTMLElement>, data: Expense) => {
    setExpenseMenuAnchorEl(event.currentTarget);
    setSelectedData(data);
  }

  const handleExpenseMenuClose = () => {
    setExpenseMenuAnchorEl(null);
  }

  const handleOpenEditModal = () => {
    setIsOpenEditModal(true)

    if(selectedData) {
      setNewName(selectedData?.name);
      setNewAmount(selectedData?.amount);
    }    
  }

  const handleOpenDeleteDialog = () => {
    setIsShowDeleteDialog(true);
  }

  const handleDeleteDialogClose = () => {
    setIsShowDeleteDialog(false);
  }

  const handleExpenseDelete = (id: number) => {
    deleteExpenseMutatation.mutate(id);
    setExpenseMenuAnchorEl(null);
    setIsShowDeleteDialog(false);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-3">      
      <div className="flex justify-end min-w-[30%]">
        <AddCircleRoundedIcon className='text-green-500 cursor-pointer' onClick={() => setIsOpenAddNew(true)} />
      </div>
      <div className="flex flex-col bg-neutral-100 min-w-[30%] max-h-[80%] px-3 py-3 gap-2 rounded-md shadow-lg overflow-auto">
        {expenseList.isPending && <p>Loading...</p>}
        {expenseList.error && <p>There was an error fetching the data.</p>}
        {expenseList.data?.length < 1 && <p>You have no expenses.</p>}
        {expenseList.data && expenseList.data.map((expense: ExpenseData) => (
          <ExpenseItem key={expense.id} data={expense} menuClick={handleExpenseItemMenuClick} />         
        ))}
      </div>
      <Menu id="action-menu" anchorEl={expenseMenuAnchorEl} open={isOpenExpenseMenu} onClose={handleExpenseMenuClose}>
        <MenuItem onClick={handleOpenEditModal}>Edit</MenuItem>
        <MenuItem onClick={handleOpenDeleteDialog}>Delete</MenuItem>
      </Menu>
      <div className="flex justify-end gap-10 min-w-[30%]">
        <h1 className='text-xl'>Total expenses</h1>
        <h1 className='font-bold text-xl'>RM {expenseTotal.data ? (expenseTotal.data).toFixed(2) : 0}</h1>
      </div>
      <Modal open={isOpenAddNew} onClose={() => setIsOpenAddNew(false)}>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-100 p-5 rounded-md w-[30%] flex flex-col gap-5'>
          <h1 className='text-2xl'>Add new expense</h1>
          <div className='flex flex-col'>
            {isShowAddNewError && 
              <Alert severity='error'>
                Please fill in all the fields
              </Alert>
            }
            <div className='flex gap-3'>
              <TextField label='Name' variant='standard' className='grow' onChange={(e) => setNewName(e.target.value)} />
              <TextField label='Amount' type='number' variant='standard' className='grow' onChange={(e) => setNewAmount(Number(e.target.value))} />   
            </div>             
          </div>
          <div className='flex justify-end gap-3'>
            <button className='text-green-700 font-semibold border-2 border-green-700 px-3 py-2 rounded-md' onClick={handleNewExpenseSubmit}>Submit</button>
            <button className='text-red-700 font-semibold border-2 border-red-700 px-3 py-2 rounded-md' onClick={handleAddNewClose}>Cancel</button>   
          </div>                   
        </div>
      </Modal>
      <Modal open={isOpenEditModal} onClose={() => setIsOpenEditModal(false)}>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-100 p-5 rounded-md w-[30%] flex flex-col gap-5'>
          <h1 className='text-2xl'>Edit Expense</h1>
          <div className='flex flex-col'>
            {isShowEditError && 
              <Alert severity='error'>
                Please fill at least one field.
              </Alert>
            }
            <div className='flex gap-3'>
              <TextField defaultValue={selectedData?.name} label='Name' variant='standard' className='grow' onChange={(e) => setNewName(e.target.value)} />
              <TextField defaultValue={selectedData?.amount.toFixed(2)} label='Amount' type='number' variant='standard' className='grow' onChange={(e) => setNewAmount(Number(e.target.value))} />   
            </div>             
          </div>
          <div className='flex justify-end gap-3'>
            <button className='text-green-700 font-semibold border-2 border-green-700 px-3 py-2 rounded-md' onClick={handleEditExpenseSubmit}>Submit</button>
            <button className='text-red-700 font-semibold border-2 border-red-700 px-3 py-2 rounded-md' onClick={handleEditModalClose}>Cancel</button>   
          </div>                   
        </div>
      </Modal>
      <Snackbar open={isShowSnackbar.open} onClose={handleSnackbarClose} autoHideDuration={3000}>
        <Alert onClose={handleSnackbarClose} severity={isShowSnackbar.severity} sx={{ width: '100%' }}>{isShowSnackbar.message}</Alert>
      </Snackbar>
      <Dialog open={isShowDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>
          Are you sure you want to delete this expense?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          {
            selectedData && <Button onClick={() => handleExpenseDelete(selectedData.id)}>Delete</Button>
          }          
        </DialogActions>
      </Dialog>
    </div>
  );
}
