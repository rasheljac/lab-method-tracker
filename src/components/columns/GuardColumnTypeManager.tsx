
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GuardColumnType {
  part_number: string;
  expected_lifetime: number;
}

interface GuardColumnTypeManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: GuardColumnType) => void;
}

export const GuardColumnTypeManager = ({ isOpen, onClose, onSelectType }: GuardColumnTypeManagerProps) => {
  const [columnTypes, setColumnTypes] = useState<GuardColumnType[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingType, setEditingType] = useState<GuardColumnType | null>(null);
  const [formData, setFormData] = useState({
    part_number: '',
    expected_lifetime: 1000
  });
  const { toast } = useToast();

  // Load saved column types from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('guardColumnTypes');
    if (saved) {
      setColumnTypes(JSON.parse(saved));
    } else {
      // Default types
      const defaultTypes = [
        { part_number: 'Standard Guard', expected_lifetime: 1000 },
        { part_number: 'High Capacity Guard', expected_lifetime: 1500 },
        { part_number: 'Ultra Guard', expected_lifetime: 2000 },
      ];
      setColumnTypes(defaultTypes);
      localStorage.setItem('guardColumnTypes', JSON.stringify(defaultTypes));
    }
  }, []);

  const saveColumnTypes = (types: GuardColumnType[]) => {
    localStorage.setItem('guardColumnTypes', JSON.stringify(types));
    setColumnTypes(types);
  };

  const handleAddType = () => {
    if (!formData.part_number.trim()) {
      toast({
        title: 'Error',
        description: 'Part number is required',
        variant: 'destructive',
      });
      return;
    }

    const newTypes = [...columnTypes, formData];
    saveColumnTypes(newTypes);
    setFormData({ part_number: '', expected_lifetime: 1000 });
    setShowAddDialog(false);
    
    toast({
      title: 'Success',
      description: 'Guard column type added successfully!',
    });
  };

  const handleEditType = () => {
    if (!editingType || !formData.part_number.trim()) return;

    const updatedTypes = columnTypes.map(type =>
      type.part_number === editingType.part_number ? formData : type
    );
    saveColumnTypes(updatedTypes);
    setEditingType(null);
    setFormData({ part_number: '', expected_lifetime: 1000 });
    
    toast({
      title: 'Success',
      description: 'Guard column type updated successfully!',
    });
  };

  const handleDeleteType = (typeToDelete: GuardColumnType) => {
    const updatedTypes = columnTypes.filter(type => type.part_number !== typeToDelete.part_number);
    saveColumnTypes(updatedTypes);
    
    toast({
      title: 'Success',
      description: 'Guard column type deleted successfully!',
    });
  };

  const startEdit = (type: GuardColumnType) => {
    setEditingType(type);
    setFormData(type);
  };

  const cancelEdit = () => {
    setEditingType(null);
    setFormData({ part_number: '', expected_lifetime: 1000 });
    setShowAddDialog(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Guard Column Type</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Type
              </Button>
            </div>

            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {columnTypes.map((type) => (
                <Card key={type.part_number} className="cursor-pointer hover:bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1"
                        onClick={() => {
                          onSelectType(type);
                          onClose();
                        }}
                      >
                        <h4 className="font-medium">{type.part_number}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">
                            {type.expected_lifetime} injections
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(type);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteType(type);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingType} onOpenChange={cancelEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Edit Guard Column Type' : 'Add Guard Column Type'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                placeholder="Enter part number"
              />
            </div>
            <div>
              <Label htmlFor="expected_lifetime">Expected Lifetime (injections)</Label>
              <Input
                id="expected_lifetime"
                type="number"
                value={formData.expected_lifetime}
                onChange={(e) => setFormData({ ...formData, expected_lifetime: parseInt(e.target.value) || 0 })}
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={editingType ? handleEditType : handleAddType}>
              {editingType ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
