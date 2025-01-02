import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import BarChart from './BarChart';
import './Overview.css';

const Overview = () => {
    const [employeesData, setEmployeesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalHours, setTotalHours] = useState({ hours: 0, mins: 0 });
    const [statusCounts, setStatusCounts] = useState({});
    const [projectCounts, setProjectCounts] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5, // Set the default page size
    });

    const convertToHoursAndMinutes = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return { hours, mins };
    };

    const cleanFieldNames = (data) => {
        return data.map((item) => {
            const cleanedItem = {};
            for (const [key, value] of Object.entries(item)) {
                const cleanedKey = key.replace(/^\uFEFF/, '');
                cleanedItem[cleanedKey] = value;
            }
            return cleanedItem;
        });
    };

    const calculateTotalHours = (timesheetData) => {
        const totalMinutes = { total: 0 };
        timesheetData.forEach((entry) => {
            const [hours, minutes, seconds] = entry.hours.split(':').map(Number);
            const totalMinutesForEntry = hours * 60 + minutes + seconds / 60;
            totalMinutes.total += totalMinutesForEntry;
            if (!totalMinutes[entry.User_Id]) {
                totalMinutes[entry.User_Id] = 0;
            }
            totalMinutes[entry.User_Id] += totalMinutesForEntry;
        });

        const totalHours = convertToHoursAndMinutes(totalMinutes.total);
        setTotalHours(totalHours);
        return totalMinutes;
    };

    const fetchData = async () => {
        try {
            const [employeeResponse, timesheetResponse, companyDetailsResponse, moduleTaskResponse] = await Promise.all([
                axios.get('http://localhost:5001/Employee_Data1'),
                axios.get('http://localhost:5001/timesheet'),
                axios.get('http://localhost:5001/CompanyDetails'),
                axios.get('http://localhost:5001/Modules_Tasks'),
            ]);

            const employeeData = employeeResponse.data;
            const timesheetData = timesheetResponse.data;
            const rawCompanyDetailsData = companyDetailsResponse.data;
            const moduleTaskData = cleanFieldNames(moduleTaskResponse.data);
            const companyDetailsData = cleanFieldNames(rawCompanyDetailsData);

            const userProjectTaskMap = new Map();
            timesheetData.forEach((entry) => {
                const { User_Id, project, task } = entry;
                const company = companyDetailsData.find(
                    (company) => company.company_id === project
                );
                const taskDetails = moduleTaskData.find(
                    (module) => module.m_slno === task
                );

                if (company || taskDetails) {
                    if (!userProjectTaskMap.has(User_Id)) {
                        userProjectTaskMap.set(User_Id, { projects: new Set(), tasks: new Set() });
                    }

                    if (company) {
                        userProjectTaskMap.get(User_Id).projects.add(company.company_name);
                    }

                    if (taskDetails) {
                        userProjectTaskMap.get(User_Id).tasks.add(taskDetails.mod_name);
                    }
                }
            });

            const statusCounts = timesheetData.reduce((acc, item) => {
                acc[item.Status] = (acc[item.Status] || 0) + 1;
                return acc;
            }, {});
            setStatusCounts(statusCounts);

            const projectCounts = {};
            employeeData.forEach((employee) => {
                const projects = userProjectTaskMap.get(employee.Emp_ID)?.projects || new Set();

                projects.forEach((project) => {
                    if (!projectCounts[project]) {
                        projectCounts[project] = 0;
                    }
                    projectCounts[project] += 1; // Increment the count for each project the employee is working on
                });
            });

            setProjectCounts(projectCounts);


            const processedData = employeeData.map((employee) => {
                const projectSet = userProjectTaskMap.get(employee.Emp_ID)?.projects || new Set();
                const taskSet = userProjectTaskMap.get(employee.Emp_ID)?.tasks || new Set();

                const formattedProjects = [...projectSet].length > 0
                    ? [...projectSet].join(', ')
                    : 'No project assigned';

                const formattedTasks = [...taskSet].length > 0
                    ? [...taskSet].join(', ')
                    : 'No task assigned';

                return {
                    id: employee.Emp_ID,
                    name: `${employee.User_Fname} ${employee.User_Lname}` || 'N/A',
                    email: employee.User_Email || 'N/A',
                    status: employee.User_Status || 'N/A',
                    companyName: formattedProjects,
                    taskName: formattedTasks,
                };
            });

            const totalMinutes = calculateTotalHours(timesheetData);
            const processedDataWithHours = processedData.map((employee) => ({
                ...employee,
                totalHours: totalMinutes[employee.id] ? convertToHoursAndMinutes(totalMinutes[employee.id]) : { hours: 0, mins: 0 },
            }));

            // Only update state if data has changed
            if (JSON.stringify(processedDataWithHours) !== JSON.stringify(employeesData)) {
                setEmployeesData(processedDataWithHours);
                setTotalEmployees(processedDataWithHours.length);
            }

        } catch (error) {
            setError('An error occurred while fetching employee data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000); // You can adjust the interval as needed
        return () => clearInterval(interval);
    }, [employeesData, fetchData]); // Add employeesData to dependency array

    // Define columns for Material React Table
    const columns = useMemo(() => [
        {
          accessorKey: 'name',
          header: 'Employee Name',
          size: 150,
        },
        {
          accessorKey: 'email',
          header: 'Email',
          size: 200,
        },
        {
          accessorKey: 'status',
          header: 'Employee Status',
          size: 150,
        },
        {
          accessorKey: 'companyName',
          header: 'Project',
          size: 200,
        },
        {
          accessorKey: 'taskName',
          header: 'Task',
          size: 200,
        },
        {
          accessorKey: 'totalHours',
          header: 'Time',
          size: 150,
          Cell: ({ cell }) => `${cell.getValue().hours} hrs ${cell.getValue().mins} mins`,
        },
      ], []);
    
      const table = useMaterialReactTable({
        columns,
        data: employeesData,
        state: { isLoading: loading, pagination },
        onPaginationChange: setPagination,
        enableFullScreenToggle: false,
        globalFilterFn: 'contains',
      });
    
      return (
        <div className="Overview-container">
          <h1 className="title">Employee Time Sheet</h1>
          <div className="counts-container">
            <p className="EmployeeCount">Total Number of Employees: {totalEmployees}</p>
            <p className="TimeCount">Total Time: {totalHours.hours} hrs {totalHours.mins} mins</p>
          </div>
          <div className="EmployeeTable">
            {error ? (
              <p className="error-text">{error}</p>
            ) : (
              <MaterialReactTable table={table} />
            )}
          </div>
          <div className="final-container">
            <div className="chart-container">
              <div className="chart1">
                <h2>Status Breakdown</h2>
                <BarChart
                  data={Object.entries(statusCounts).map(([key, value]) => ({ name: key, value }))}
                  text='Number of Status'
                />
              </div>
            </div>
            <div className="chart-container1">
              <div className="chart2">
                <h2>Projects Breakdown</h2>
                <BarChart
                  data={Object.entries(projectCounts).map(([key, value]) => ({ name: key, value }))}
                  columnWidth='70%'
                />
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    export default Overview;
    