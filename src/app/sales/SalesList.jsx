import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import {
  ChevronDown,
  Edit,
  Eye,
  Search,
  SquarePlus,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {   navigateTOPurchaseGraniteEdit, navigateTOPurchaseGraniteView, navigateTOPurchaseTilesEdit, navigateTOPurchaseTilesView, navigateTOSalesEdit, navigateTOSalesView, PURCHASE_GRANITE_LIST, PURCHASE_TILES_LIST, SALES_LIST } from "@/api";
import Loader from "@/components/loader/Loader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";


const SalesList = () => {
     const {
        data: sales,
        isLoading,
        isError,
        refetch,
      } = useQuery({
        queryKey: ["sales"],
        queryFn: async () => {
          const token = localStorage.getItem("token");
          const response = await axios.get(`${SALES_LIST}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data.sales;
        },
      });
     
      // State for table management
      const [sorting, setSorting] = useState([]);
      const [columnFilters, setColumnFilters] = useState([]);
      const [columnVisibility, setColumnVisibility] = useState({});
      const [rowSelection, setRowSelection] = useState({});
      const [searchQuery, setSearchQuery] = useState("");
    
      const navigate = useNavigate();
    
      // Define columns for the table
      const columns = [
        {
          id: "S. No.",
          accessorKey: "index",
          header: "Sl No",
          cell: ({ row }) => <div>{row.index + 1}</div>,
        },
    
          {
                 accessorKey: "sales_date",
                 id:"Date",
                 header: "Date",
                 cell: ({ row }) => {
                   const date = row.getValue("Date");
                   return moment(date).format("DD-MMM-YYYY");
                 },
               },
        {
          accessorKey: "sales_no",
          id:"Estimate No",
          header: "Estimate No",
          cell: ({ row }) => <div>{row.getValue("Estimate No")}</div>,
        },
        {
          accessorKey: "sales_customer",
          id:"Customer",
          header: "Customer",
          cell: ({ row }) => <div>{row.getValue("Customer")}</div>,
        },
     



        {
          accessorKey: "sales_no_of_count",
          id:"No Of Items",
          header: "No Of Items",
          cell: ({ row }) => <div>{row.getValue("No Of Items")}</div>,
        },
      


        {
          accessorKey: "sales_gross",
          id:"Gross",
          header: "Gross",
          cell: ({ row }) => <div>{row.getValue("Gross")}</div>,
        },
        {
          accessorKey: "sales_advance",
          id:"Advance",
          header: "Advance",
          cell: ({ row }) => <div>{row.getValue("Advance")}</div>,
        },
        {
          accessorKey: "sales_balance",
          id:"Balance",
          header: "Balance",
          cell: ({ row }) => <div>{row.getValue("Balance")}</div>,
        },




      

       {
             id: "actions",
             header: "Action",
             cell: ({ row }) => {
               const salesId = row.original.id;
       
               return (
                 <div className="flex flex-row">
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                           onClick={() => {
                            navigateTOSalesEdit(navigate, salesId)
                           }}
                         >
                           <Edit />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>Edit Sales</p>
                       </TooltipContent>
                     </Tooltip>
       
                    
                   </TooltipProvider>
                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <Button
                           variant="ghost"
                           size="icon"
                          //  onClick={() => {
                          //   navigateTOSalesView(navigate, salesId)
                          //  }}
                          onClick={() => navigate(`/sales/view/${salesId}`)}
                         >
                           <Eye />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>View Sales</p>
                       </TooltipContent>
                     </Tooltip>
       
                    
                   </TooltipProvider>
                 </div>
               );
             },
           },
      ];
    
    
      // Create the table instance
      const table = useReactTable({
        data: sales || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
          sorting,
          columnFilters,
          columnVisibility,
          rowSelection,
        },
        initialState: {
          pagination: {
            pageSize: 7,
          },
        },
      });
    
      // Render loading state
      if (isLoading) {
        return (
          <Page>
            <div className="flex justify-center items-center h-full">
              <Loader />
            </div>
          </Page>
        );
      }
    
      // Render error state
      if (isError) {
        return (
          <Page>
            <Card className="w-full max-w-md mx-auto mt-10">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Error Fetching Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </Page>
        );
      }
    
  return (
    <Page>
       <div className="w-full p-0 md:p-4 grid grid-cols-1">
         <div className="sm:hidden">
          <p>
            mobile Sales
          </p>
         </div>
 
         <div className="hidden sm:block">
         <div className="flex text-left text-2xl text-gray-800 font-[400]">
         Sales List
          </div>

          <div className="flex flex-col md:flex-row md:items-center py-4 gap-2">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search sales..."
                value={table.getState().globalFilter || ""}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full"
              />
            </div>

            {/* Dropdown Menu & Sales Button */}
            <div className="flex flex-col md:flex-row md:ml-auto gap-2 w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="default"
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                // onClick={() => {
                //   navigate("/sales/create");
                // }}
              >
                <SquarePlus className="h-4 w-4" /> Sales
              </Button>{" "}
            </div>
          </div>
          {/* table  */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* row slection and pagintaion button  */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Total Sales : &nbsp;
              {table.getFilteredRowModel().rows.length}
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
         </div>
       </div>
      
     </Page>
  )
}

export default SalesList