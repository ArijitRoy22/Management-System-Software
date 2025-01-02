import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import BarChart from './BarChart'; 
import './Project.css'

const Project = () => {
    const [projectsData, setProjectsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [projectCounts, setProjectCounts] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5,
    });

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

    const fetchData = async () => {
        try {
            const [employeeResponse, timesheetResponse, companyDetailsResponse] = await Promise.all([
                axios.get('http://localhost:5001/Employee_Data1'),
                axios.get('http://localhost:5001/timesheet'),
                axios.get('http://localhost:5001/CompanyDetails'),
            ]);

            const employeeData = cleanFieldNames(employeeResponse.data);
            const timesheetData = cleanFieldNames(timesheetResponse.data);
            const companyDetailsData = cleanFieldNames(companyDetailsResponse.data);

            const userProjectMap = new Map();
            timesheetData.forEach((entry) => {
                const { User_Id, project } = entry;
                const company = companyDetailsData.find(
                    (company) => company.company_id === project
                );

                if (company) {
                    if (!userProjectMap.has(company.company_id)) {
                        userProjectMap.set(company.company_id, new Set());
                    }
                    userProjectMap.get(company.company_id).add(User_Id);
                }
            });

            const projectCounts = {};
            companyDetailsData.forEach((company) => {
                const employees = userProjectMap.get(company.company_id) || new Set();
                projectCounts[company.company_name] = employees.size;
            });

            setProjectCounts(projectCounts);

            const processedProjectsData = companyDetailsData.map((company) => {
                const employees = userProjectMap.get(company.company_id) || new Set();
                const employeeList = [...employees]
                    .map((empId) => employeeData.find(emp => emp.Emp_ID === empId)?.User_Fname + ' ' + employeeData.find(emp => emp.Emp_ID === empId)?.User_Lname)
                    .filter(Boolean)
                    .join(', ');

                return {
                    id: company.company_id,
                    name: company.company_name || 'N/A',
                    manager: company.client_name || 'NA',
                    employees: employeeList.length > 0 ? employeeList : 'No Employees Assigned',
                    status: company.status || 'N/A',
                };
            });

            // Only update state if the data has changed
            if (JSON.stringify(processedProjectsData) !== JSON.stringify(projectsData)) {
                setProjectsData(processedProjectsData);
            }

        } catch (error) {
            setError('An error occurred while fetching project data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000); // Fetch data every 10 seconds
        return () => clearInterval(interval);
    }, [projectsData]);

    const columns = useMemo(() => [
        {
            accessorKey: 'id',
            header: 'Project ID',
            size: 100,
        },
        {
            accessorKey: 'name',
            header: 'Project Name',
            size: 150,
        },
        {
            accessorKey: 'manager',
            header: 'Project Manager',
            size: 150,
        },
        {
            accessorKey: 'employees',
            header: 'Employees Working',
            size: 150,
            Cell: ({ cell }) => (
                <select>
                    {cell.getValue().split(', ').map((employee, index) => (
                        <option key={index} value={employee}>{employee}</option>
                    ))}
                </select>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 250,
        },
        

    ], []);

    const table = useMaterialReactTable({
        columns,
        data: projectsData.slice(
            pagination.pageIndex * pagination.pageSize,
            (pagination.pageIndex + 1) * pagination.pageSize
        ),
        state: {
            isLoading: loading,
            pagination: {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            },
        },
        rowCount: projectsData.length, // Total number of projects
        manualPagination: true, // Enables manual control of pagination
        onPaginationChange: setPagination, // Update pagination state
        pageCount: Math.ceil(projectsData.length / pagination.pageSize), // Dynamically calculate page count
        enableFullScreenToggle: false,
        globalFilterFn: 'contains',
    });

    return (
        <div className="Project-container">
            <h1 className="title">Projects Overview</h1>
            <div className="ProjectTable">
                {error ? (
                    <p className="error-text">{error}</p>
                ) : (
                    <MaterialReactTable table={table} />
                )}
            </div>
            <div className="ProjectBar-container">
                <div className="Projectchart-container">
                    <div className="ProjectBarchart1">
                        <h2>Project Distribution</h2>
                        <BarChart
                            data={Object.entries(projectCounts).map(([key, value]) => ({ name: key, value}))}
                            text='Number of Employees'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Project;
