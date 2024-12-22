import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { MouseEvent } from 'react';

interface Expense {
    id: number,
    name: string,
    amount: number,
    createdAt: string,
    updatedAt: string
}

interface ExpenseItemProps {
    data: Expense,
    menuClick: (event: MouseEvent<HTMLElement>, id: number) => void
}

export default function ExpenseItem(props: ExpenseItemProps) {
    return (
        <div className="flex gap-3 border-b-2 px-3 py-5 transition-colors hover:bg-blue-100 rounded-md">
            <div className='flex justify-between grow'>
                <h1>{props.data.name}</h1>
                <h1 className='font-bold'>RM {props.data.amount.toFixed(2)}</h1>
            </div>
            <div className='text-neutral-500 cursor-pointer' onClick={(e) =>props.menuClick(e, props.data.id)}>
                <MoreVertRoundedIcon />    
            </div>            
        </div>
    );
}