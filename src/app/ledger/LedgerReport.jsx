import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import moment from "moment";
import { Printer, FileText, FileDown, Search, ChevronDown, Check } from "lucide-react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import BASE_URL from "@/config/BaseUrl";
import html2pdf from "html2pdf.js";
import Select from "react-select";
const formSchema = z.object({
  account_name: z.string().min(1, "Account name is required"),
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
});
const selectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '40px',
    height: '40px',
    borderRadius: '0.375rem',
    borderColor: 'hsl(var(--input))',
    backgroundColor: 'hsl(var(--background))',
    boxShadow: 'none',
    '&:hover': {
      borderColor: 'hsl(var(--input))',
    },
    '&:focus-within': {
      borderColor: 'hsl(var(--ring))',
      boxShadow: '0 0 0 2px hsl(var(--ring))',
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: '0',
    padding: '0',
    color: 'hsl(var(--foreground))',
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '40px',
    padding: '0 12px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'hsl(var(--muted-foreground))',
    padding: '8px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.375rem',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'hsl(var(--primary))' 
      : state.isFocused 
        ? 'hsl(var(--accent))' 
        : 'hsl(var(--background))',
    color: state.isSelected 
      ? 'hsl(var(--primary-foreground))' 
      : 'hsl(var(--foreground))',
    '&:hover': {
      backgroundColor: 'hsl(var(--accent))',
      color: 'hsl(var(--accent-foreground))',
    },
  }),
};
const LedgerReport = () => {
  const { toast } = useToast();
  const tableRef = useRef(null);
  const [searchParams, setSearchParams] = useState(null);
  const [query, setQuery] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account_name: "",
      from_date: getTodayDate(),
      to_date: getTodayDate(),
    },
  });

  // Fetch account names
  const { data: accountNames = [] } = useQuery({
    queryKey: ["ledgerAccountNames"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/api/web-fetch-ledger-accountname`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.mix || [];
    },
  });

  // Fetch ledger data
  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ["ledgerReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return { payment: [], received: [] };

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-fetch-ledger-report-new`,
        searchParams,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
    enabled: !!searchParams,
  });

  const onSubmit = (data) => {
    if (searchParams && JSON.stringify(searchParams) === JSON.stringify(data)) {
      toast({
        title: "Same search parameters",
        description: "You're already viewing results for these search criteria",
        variant: "default",
      });
      return;
    }
    setSearchParams(data);
  };

  const handleDownloadCsv = async () => {
    try {
      if (!searchParams) return;

      const response = await axios.post(
        `${BASE_URL}/api/web-download-ledger-report-new`,
        searchParams,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ledger.csv");
      document.body.appendChild(link);
      link.click();

      toast({
        title: "Download Successful",
        description: "Ledger report downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download ledger report",
        variant: "destructive",
      });
    }
  };

  const handlePrintPdf = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `Ledger-Report-${searchParams?.account_name}`,
    pageStyle: `
         @page {
                      size: auto;
                      margin: 5mm;
                    }
                    @media print {
                      body { 
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                      }
                      .hidden.sm\\:block {
                        display: block !important;
                      }
                      .flex-col.md\\:flex-row {
                        display: flex !important;
                        flex-direction: row !important;
                        width: 100% !important;
                        gap: 16px !important;
                      }
                      .flex-1 {
                        flex: 1 1 0% !important;
                        width: 50% !important;
                      }
                      table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 10pt !important;
                      }
                      th, td {
                        border: 1px solid #ddd !important;
                        padding: 4px !important;
                        text-align: center !important;
                      }
                      .bg-blue-50 {
                        background-color: rgba(239, 246, 255, 1) !important;
                      }
                      .bg-blue-50\\/30 {
                        background-color: rgba(239, 246, 255, 0.3) !important;
                      }
                      .bg-gray-100 {
                        background-color: rgba(243, 244, 246, 1) !important;
                      }
                      .bg-gray-50\\/30 {
                        background-color: rgba(249, 250, 251, 0.3) !important;
                      }
                    }
      `,
  });
  const handleDownloadPDF = () => {
    const input = tableRef.current;
    const options = {
      margin: [5, 5, 5, 5],
      filename: "ledger-report.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowHeight: input.scrollHeight,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: "avoid-all" },
    };

    html2pdf()
      .from(input)
      .set(options)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 20,
            pdf.internal.pageSize.getHeight() - 10
          );
        }
      })
      .save()
      .then(() => {
        toast({
          title: "PDF Generated",
          description: "Ledger report saved as PDF",
        });
      });
  };

  const calculateTotalPayment = () => {
    if (!ledgerData?.payment) return 0;
    return ledgerData.payment.reduce((total, item) => total + (Number(item.payment_amount) || 0), 0);
  };

  const calculateTotalReceived = () => {
    if (!ledgerData?.received) return 0;
    return ledgerData.received.reduce((total, item) => total + (Number(item.received_amount) || 0), 0);
  };

 

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
               <div className="sm:hidden">
                <p>
                  mobile ledger
                </p>
               </div>
      <div className="hidden sm:block">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Ledger Report</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
           {/* Account Name  */}
           <div className="space-y-1">
  <Label htmlFor="account_name">Account Name</Label>
  <Select
    id="account_name"
    options={accountNames.map(account => ({
      value: account.account_name,
      label: account.account_name
    }))}
    value={accountNames.find(account => 
      account.account_name === form.watch("account_name")
    ) ? {
      value: form.watch("account_name"),
      label: form.watch("account_name")
    } : null}
    onChange={(selected) => 
      form.setValue("account_name", selected?.value || "")
    }
    styles={selectStyles}
    className="react-select-container"
    classNamePrefix="react-select"
    placeholder="Select account..."
    isClearable
    required
  />
  {form.formState.errors.account_name && (
    <p className="text-sm text-red-500">
      {form.formState.errors.account_name.message}
    </p>
  )}
</div>

              <div className="space-y-1">
                <Label htmlFor="from_date">From Date</Label>
                <Input
                  id="from_date"
                  type="date"
                  {...form.register("from_date")}
                />
                {form.formState.errors.from_date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.from_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="to_date">To Date</Label>
                <Input
                  id="to_date"
                  type="date"
                  {...form.register("to_date")}
                />
                {form.formState.errors.to_date && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.to_date.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          {searchParams && (
            <>
              <CardHeader className="border-t">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2">
                  <CardTitle className="text-lg flex flex-row items-center gap-2">
                    <span>Report Results</span>
                    {ledgerData && (
                      <span className="text-blue-800 text-xs">
                        {moment(searchParams.from_date).format("DD-MM-YYYY")} to {moment(searchParams.to_date).format("DD-MM-YYYY")}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadCsv}
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPDF}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                 <Button variant="outline" size="sm" onClick={handlePrintPdf}>
                                       <Printer className="mr-2 h-4 w-4" />
                                       Print
                                     </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div ref={tableRef} className="overflow-x-auto print:p-4">
                  <div className="text-center mb-4 font-semibold">
                    Ledger Report - {searchParams.account_name}
                  </div>
                  <div className="text-center text-sm mb-6">
                    From {moment(searchParams.from_date).format("DD-MM-YYYY")} to {moment(searchParams.to_date).format("DD-MM-YYYY")}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Debit Table */}
                    <div className="flex-1">
                      <Table className="border">
                        <TableHeader>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead colSpan={2} className="text-center bg-blue-50">
                              Debit Transactions
                            </TableHead>
                          </TableRow>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead className="text-center border-r">Date</TableHead>
                            <TableHead className="text-center">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ledgerData?.payment?.length ? (
                            ledgerData.payment.map((item, index) => (
                              <TableRow
                                key={`debit-${index}`}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                              >
                                <TableCell className="text-center border-r">
                                  {moment(item.payment_date).format("DD-MM-YYYY")}
                                </TableCell>
                                <TableCell className="text-center">
                                  {item.payment_amount}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                                No debit transactions found
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="bg-blue-50/30 font-medium">
                            <TableCell className="text-center border-r">Total</TableCell>
                            <TableCell className="text-center">
                              {calculateTotalPayment()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    {/* Credit Table */}
                    <div className="flex-1">
                      <Table className="border">
                        <TableHeader>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead colSpan={2} className="text-center bg-blue-50">
                              Credit Transactions
                            </TableHead>
                          </TableRow>
                          <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead className="text-center border-r">Date</TableHead>
                            <TableHead className="text-center">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ledgerData?.received?.length ? (
                            ledgerData.received.map((item, index) => (
                              <TableRow
                                key={`credit-${index}`}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                              >
                                <TableCell className="text-center border-r">
                                  {moment(item.received_date).format("DD-MM-YYYY")}
                                </TableCell>
                                <TableCell className="text-center">
                                  {item.received_amount}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                                No credit transactions found
                              </TableCell>
                            </TableRow>
                          )}
                          <TableRow className="bg-blue-50/30 font-medium">
                            <TableCell className="text-center border-r">Total</TableCell>
                            <TableCell className="text-center">
                              {calculateTotalReceived()}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="mt-6 text-center font-medium">
                    Balance (
                    {calculateTotalReceived() - calculateTotalPayment() >= 0
                      ? " to be paid "
                      : " to be received "}
                    ) = ₹
                    {Math.abs(calculateTotalReceived() - calculateTotalPayment())}
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
      </div>
    </Page>
  );
};

export default LedgerReport;