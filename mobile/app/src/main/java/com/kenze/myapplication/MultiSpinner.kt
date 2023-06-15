package com.kenze.myapplication

import android.R
import android.app.AlertDialog
import android.content.Context
import android.content.DialogInterface
import android.content.DialogInterface.OnMultiChoiceClickListener
import android.util.AttributeSet
import android.util.Log
import android.widget.ArrayAdapter


class MultiSpinner : androidx.appcompat.widget.AppCompatSpinner, OnMultiChoiceClickListener, DialogInterface.OnCancelListener {
    private var items: List<String>? = null
    private var selected: BooleanArray = booleanArrayOf()
    private var defaultText: String? = null
    private var listener: MultiSpinnerListener? = null

    constructor(context: Context) : super(context) {}
    constructor(arg0: Context, arg1: AttributeSet?) : super(arg0, arg1) {}
    constructor(arg0: Context, arg1: AttributeSet?, arg2: Int) : super(arg0, arg1, arg2) {}

    override fun onClick(dialog: DialogInterface, which: Int, isChecked: Boolean) {
        selected[which] = isChecked
    }

    override fun onCancel(dialog: DialogInterface?) {
        // refresh text on spinner
        val spinnerBuffer = StringBuffer()
        var someSelected = false
        for (i in items!!.indices) {
            if (selected[i]) {
                spinnerBuffer.append(items!![i])
                spinnerBuffer.append(", ")
                someSelected = true
            }
        }
        var spinnerText: String?
        if (someSelected) {
            spinnerText = spinnerBuffer.toString()
            if (spinnerText.length > 2) spinnerText =
                spinnerText.substring(0, spinnerText.length - 2)
        } else {
            spinnerText = defaultText
        }
        val adapter = ArrayAdapter(
            context,
            R.layout.simple_spinner_item, arrayOf(spinnerText)
        )
        setAdapter(adapter)
        listener!!.onItemsSelected(selected)
    }

    override fun performClick(): Boolean {
        val builder = AlertDialog.Builder(context)
        builder.setMultiChoiceItems(
            items!!.toTypedArray<CharSequence>(), selected, this
        )
        builder.setPositiveButton(
            R.string.ok
        ) { dialog, _ -> dialog.cancel() }
        builder.setOnCancelListener(this)

        val dialog = builder.create()
        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setTextColor(resources.getColor(com.kenze.myapplication.R.color.dialogBtn))
        }
        dialog.show()
        return true
    }

    fun setItems(
        items: List<String>, allText: String?,
        selectedItems: List<String>,
        listener: MultiSpinnerListener?
    ) {
        this.items = items
        defaultText = allText
        this.listener = listener

        // all selected by default
        selected = BooleanArray(items.size)
        for (i in selected.indices) {
            selected[i] = selectedItems.contains(items[i])
        }

        // all text on the spinner
        val adapter = ArrayAdapter(
            context,
            R.layout.simple_spinner_item, arrayOf(allText)
        )
        setAdapter(adapter)
    }

    interface MultiSpinnerListener {
        fun onItemsSelected(selected: BooleanArray?)
    }
}