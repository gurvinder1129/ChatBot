package dto;

import java.util.ArrayList;

public class Objects {
	public  ArrayList<String > cols=new ArrayList<String >();

    public  void add(String Value)
    {cols.add(Value);
	}
    public  ArrayList<String> getValues()
    { 
    	return cols;
    }
}
