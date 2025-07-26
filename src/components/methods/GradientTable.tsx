
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GradientStep {
  time: number;
  percent_a: number;
  percent_b: number;
  flow_rate: number;
}

interface GradientTableProps {
  value: GradientStep[];
  onChange: (steps: GradientStep[]) => void;
  readOnly?: boolean;
}

export const GradientTable = ({ value, onChange, readOnly = false }: GradientTableProps) => {
  const [steps, setSteps] = useState<GradientStep[]>([]);

  useEffect(() => {
    console.log('GradientTable useEffect - value:', value, 'readOnly:', readOnly);
    
    if (value && Array.isArray(value) && value.length > 0) {
      console.log('Setting steps from value prop:', value);
      setSteps(value);
    } else if (!readOnly) {
      // Only initialize with default step for new methods (not readonly)
      console.log('Setting default step for new method');
      const defaultSteps = [{ time: 0, percent_a: 95, percent_b: 5, flow_rate: 0.3 }];
      setSteps(defaultSteps);
      onChange(defaultSteps);
    } else {
      // For readonly mode with no data, show empty
      console.log('Setting empty steps for readonly mode');
      setSteps([]);
    }
  }, [value, readOnly, onChange]);

  const handleStepChange = (index: number, field: keyof GradientStep, newValue: string) => {
    if (readOnly) return;
    
    const numValue = parseFloat(newValue) || 0;
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: numValue };
    
    // Auto-calculate percent_b when percent_a changes
    if (field === 'percent_a') {
      updatedSteps[index].percent_b = 100 - numValue;
    } else if (field === 'percent_b') {
      updatedSteps[index].percent_a = 100 - numValue;
    }
    
    setSteps(updatedSteps);
    onChange(updatedSteps);
  };

  const addStep = () => {
    if (readOnly) return;
    
    const lastStep = steps[steps.length - 1];
    const newStep: GradientStep = {
      time: lastStep ? lastStep.time + 1 : 0,
      percent_a: 50,
      percent_b: 50,
      flow_rate: lastStep ? lastStep.flow_rate : 0.3
    };
    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);
    onChange(updatedSteps);
  };

  const removeStep = (index: number) => {
    if (readOnly || steps.length <= 1) return;
    
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    onChange(updatedSteps);
  };

  // Prepare data for chart
  const chartData = steps.map(step => ({
    time: step.time,
    'Mobile Phase A (%)': step.percent_a,
    'Mobile Phase B (%)': step.percent_b,
    'Flow Rate (mL/min)': step.flow_rate * 100 // Scale for visibility
  }));

  // For readonly mode, always show the table even if empty
  if (readOnly && (!steps || steps.length === 0)) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Gradient Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">No gradient data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Gradient Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time (min)</TableHead>
                  <TableHead>%A</TableHead>
                  <TableHead>%B</TableHead>
                  <TableHead>Flow Rate (mL/min)</TableHead>
                  {!readOnly && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {steps.map((step, index) => (
                  <TableRow key={index} className={index % 2 === 1 ? 'bg-muted/50' : ''}>
                    <TableCell>
                      {readOnly ? (
                        <div className="text-sm">{step.time}</div>
                      ) : (
                        <Input
                          type="number"
                          step="0.1"
                          value={step.time}
                          onChange={(e) => handleStepChange(index, 'time', e.target.value)}
                          className="h-8"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <div className="text-sm">{step.percent_a}%</div>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={step.percent_a}
                          onChange={(e) => handleStepChange(index, 'percent_a', e.target.value)}
                          className="h-8"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <div className="text-sm">{step.percent_b}%</div>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={step.percent_b}
                          onChange={(e) => handleStepChange(index, 'percent_b', e.target.value)}
                          className="h-8"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {readOnly ? (
                        <div className="text-sm">{step.flow_rate}</div>
                      ) : (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={step.flow_rate}
                          onChange={(e) => handleStepChange(index, 'flow_rate', e.target.value)}
                          className="h-8"
                        />
                      )}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                          disabled={steps.length === 1}
                          className="h-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Always show chart if there are steps */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gradient Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ height: '400px', minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    label={{ value: 'Time (min)', position: 'insideBottomLeft', offset: 0 }}
                  />
                  <YAxis 
                    label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="Mobile Phase A (%)" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Mobile Phase B (%)" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
